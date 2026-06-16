"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useVoice, VoiceReadyState } from "@humeai/voice-react";
import { Loader2Icon, MicIcon, MicOffIcon, PhoneOffIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { env } from "@/data/env/client";
import { JobInfoTable } from "@/drizzle/schema";
import {
  createInterview,
  updateInterview,
} from "@/features/interviews/actions";
import { errorToast } from "@/lib/error-toast";
import { CondensedMessages } from "@/services/hume/components/condensed-messages";
import { condenseChatMessages } from "@/services/hume/lib/condense-chat-messages";

/**
 * Props for the StartCall component.
 *
 * @property {string} accessToken - The Hume AI access token used to
 * authenticate the voice session.
 * @property {Pick<typeof JobInfoTable.$inferSelect, "id" | "title" |
 * "description" | "experienceLevel">} jobInfo - A subset of job information
 * used to configure the interview session and session variables.
 * @property {{ name: string; imageUrl: string }} user - The current user's
 * display name and avatar URL, used in the session settings and message
 * display.
 */
interface StartCallProps {
  accessToken: string;
  jobInfo: Pick<
    typeof JobInfoTable.$inferSelect,
    "id" | "title" | "description" | "experienceLevel"
  >;
  user: {
    name: string;
    imageUrl: string;
  };
}

/**
 * `StartCall` is the top-level component responsible for managing the full
 * lifecycle of a voice-based AI interview session.
 *
 * ### Responsibilities
 * - Renders a "Start Interview" button when the voice session is idle.
 * - Creates a new interview record in the database before connecting.
 * - Connects to the Hume AI voice service with job-specific session variables.
 * - Syncs the Hume `chatId` to the interview record once the session begins.
 * - Periodically persists the call duration to the database every 10 seconds.
 * - Handles disconnection by saving the final duration and redirecting the
 *   user to the appropriate interview results page.
 * - Displays a loading spinner while the connection is establishing or closing.
 * - Renders the live interview UI (messages + controls) when connected.
 *
 * ### State Transitions
 * ```
 * IDLE ──(click Start)──► CONNECTING ──► OPEN ──(disconnect)──► CLOSED
 *                                                                   │
 *                                            redirect to interview  ▼
 *                                            results or list page ◄─┘
 * ```
 *
 * @param {StartCallProps} props - The component props.
 * @returns {JSX.Element} The appropriate UI for the current voice ready state.
 *
 * @example
 * ```tsx
 * <StartCall
 *   accessToken={token}
 *   jobInfo={{ id, title, description, experienceLevel }}
 *   user={{ name: "Jane Doe", imageUrl: "/avatar.png" }}
 * />
 * ```
 */
export const StartCall = ({ jobInfo, user, accessToken }: StartCallProps) => {
  const { connect, readyState, chatMetadata, callDurationTimestamp } =
    useVoice();

  /** Stores the database ID of the interview created at session start. */
  const [interviewId, setInterviewId] = useState<string | null>(null);

  /**
   * Ref that mirrors `callDurationTimestamp` so interval callbacks can
   * access the latest value without being re-registered on every tick.
   */
  const durationRef = useRef(callDurationTimestamp);

  const router = useRouter();

  /**
   * Keeps `durationRef` in sync with the latest `callDurationTimestamp`
   * value from the voice hook without triggering re-renders or causing
   * stale closure issues inside the periodic sync interval.
   */
  useEffect(() => {
    durationRef.current = callDurationTimestamp;
  }, [callDurationTimestamp]);

  /**
   * Syncs the Hume `chatId` to the interview record in the database.
   * Runs whenever the chat metadata or interview ID changes.
   * Skips execution if either value is not yet available.
   */
  useEffect(() => {
    if (chatMetadata?.chatId == null || interviewId == null) {
      return;
    }
    updateInterview(interviewId, { humeChatId: chatMetadata.chatId });
  }, [chatMetadata?.chatId, interviewId]);

  /**
   * Periodically persists the current call duration to the database every
   * 10 seconds. Uses a ref to read the latest timestamp value without
   * restarting the interval on every duration change.
   * The interval is cleared when the component unmounts or `interviewId`
   * changes.
   */
  useEffect(() => {
    if (interviewId == null) return;

    const intervalId = setInterval(() => {
      if (durationRef.current == null) return;
      updateInterview(interviewId, { duration: durationRef.current });
    }, 10_000);

    return () => clearInterval(intervalId);
  }, [interviewId]);

  /**
   * Handles the voice session disconnect event.
   *
   * - If the session closes before an interview was created (e.g. connection
   *   failed immediately), the user is redirected to the interviews list.
   * - If an interview exists, the final duration is saved and the user is
   *   redirected to the specific interview results page.
   */
  useEffect(() => {
    if (readyState !== VoiceReadyState.CLOSED) return;

    if (interviewId == null) {
      return router.push(`/app/job-infos/${jobInfo.id}/interviews`);
    }

    if (durationRef.current != null) {
      updateInterview(interviewId, { duration: durationRef.current });
    }

    router.push(`/app/job-infos/${jobInfo.id}/interviews/${interviewId}`);
  }, [interviewId, readyState, router, jobInfo.id]);

  /**
   * Idle state: Render the entry point for starting a new interview.
   *
   * On click:
   * 1. Creates a new interview record linked to the current job.
   * 2. Stores the returned interview ID in state.
   * 3. Connects to the Hume AI voice service with job-specific session
   *    variables injected as config overrides.
   */
  if (readyState === VoiceReadyState.IDLE) {
    return (
      <div className="flex justify-center items-center h-screen-header">
        <Button
          size="lg"
          onClick={async () => {
            const res = await createInterview({ jobInfoId: jobInfo.id });

            if (res.error) {
              return errorToast(res.message);
            }

            setInterviewId(res.id);

            connect({
              auth: { type: "accessToken", value: accessToken },
              configId: env.NEXT_PUBLIC_HUME_CONFIG_ID,
              sessionSettings: {
                type: "session_settings",
                variables: {
                  userName: user.name,
                  title: jobInfo.title || "Not Specified",
                  description: jobInfo.description,
                  experienceLevel: jobInfo.experienceLevel,
                },
              },
            });
          }}
        >
          Start Interview
        </Button>
      </div>
    );
  }

  /**
   * Connecting / Closed state: Render a full-screen loading spinner.
   *
   * Shown while the WebSocket connection is being established (`CONNECTING`)
   * or after it has been closed and the disconnect handler is running
   * (`CLOSED`), before the router redirect completes.
   */
  if (
    readyState === VoiceReadyState.CONNECTING ||
    readyState === VoiceReadyState.CLOSED
  ) {
    return (
      <div className="flex justify-center items-center h-screen-header">
        <Loader2Icon className="animate-spin size-24" />
      </div>
    );
  }

  /**
   * Open state: Render the live interview interface.
   * Displays the scrollable message feed and the sticky control bar.
   */
  return (
    <div className="flex overflow-y-auto flex-col-reverse h-screen-header">
      <div className="container flex flex-col gap-4 justify-end items-center py-6">
        <Messages user={user} />
        <Controls />
      </div>
    </div>
  );
};

/**
 * Props for the `Messages` component.
 *
 * @property {{ name: string; imageUrl: string }} user - The current user's
 * display information passed down for rendering message avatars and labels.
 */
interface MessagesProps {
  user: { name: string; imageUrl: string };
}

/**
 * `Messages` displays the conversation history of the current voice session.
 *
 * It reads raw messages from the Hume voice context, condenses consecutive
 * messages from the same speaker into grouped entries for a cleaner UI, and
 * passes the FFT audio data to `CondensedMessages` so the AI avatar can
 * animate in sync with the AI's speech output.
 *
 * @param {MessagesProps} props - The component props.
 * @returns {JSX.Element} A scrollable list of condensed conversation messages.
 */
const Messages = ({ user }: MessagesProps) => {
  const { messages, fft } = useVoice();

  /**
   * Memoized condensed message list.
   * Re-computes only when the raw `messages` array reference changes,
   * preventing unnecessary recalculations on unrelated re-renders.
   */
  const condensedMessages = useMemo(() => {
    return condenseChatMessages(messages);
  }, [messages]);

  return (
    <CondensedMessages
      className="max-w-5xl"
      maxFft={Math.max(...fft)}
      messages={condensedMessages}
      user={user}
    />
  );
};

/**
 * `Controls` renders the sticky call control bar displayed during an active
 * voice session.
 *
 * ### Features
 * - **Mute / Unmute** toggle button with accessible screen-reader label.
 * - **FFT visualizer** that animates in real-time with the user's microphone
 *   input level.
 * - **Call duration** timestamp displayed in a tabular numeric format.
 * - **End Call** button that disconnects the voice session and triggers the
 *   disconnect handler in `StartCall`.
 *
 * @returns {JSX.Element} A sticky bottom control bar for the interview UI.
 */
const Controls = () => {
  const { disconnect, isMuted, mute, unmute, micFft, callDurationTimestamp } =
    useVoice();

  return (
    <div className="flex sticky bottom-6 gap-5 items-center px-5 py-2 rounded border w-fit bg-background">
      {/* Mute / Unmute toggle */}
      <Button
        className="-mx-3"
        size="icon"
        variant="ghost"
        onClick={() => (isMuted ? unmute() : mute())}
      >
        {isMuted ? <MicOffIcon className="text-destructive" /> : <MicIcon />}
        <span className="sr-only">{isMuted ? "Unmute" : "Mute"}</span>
      </Button>

      {/* Microphone FFT audio visualizer */}
      <div className="self-stretch">
        <FftVisualizer fft={micFft} />
      </div>

      {/* Live call duration counter */}
      <div className="text-sm tabular-nums text-muted-foreground">
        {callDurationTimestamp}
      </div>

      {/* End call / disconnect button */}
      <Button
        className="-mx-3"
        size="icon"
        variant="ghost"
        onClick={disconnect}
      >
        <PhoneOffIcon className="text-destructive" />
        <span className="sr-only">End Call</span>
      </Button>
    </div>
  );
};

/**
 * Props for the `FftVisualizer` component.
 *
 * @property {number[]} fft - An array of FFT amplitude values in the range
 * `[0, 4]`, where each element corresponds to a frequency band. Used to
 * determine the rendered height of each bar in the visualizer.
 */
interface FftVisualizerProps {
  fft: number[];
}

/**
 * `FftVisualizer` renders a real-time bar-graph audio visualizer driven by
 * FFT (Fast Fourier Transform) frequency data from the microphone input.
 *
 * ### Rendering Logic
 * - Each element in `fft` is mapped to a vertical bar.
 * - The raw amplitude value (range `0–4`) is converted to a percentage
 *   height relative to the container.
 * - Bars with a computed percentage below 10% are rendered at zero height
 *   to suppress visual noise from near-silence.
 *
 * @param {FftVisualizerProps} props - The component props.
 * @returns {JSX.Element} A row of animated frequency bars.
 */
const FftVisualizer = ({ fft }: FftVisualizerProps) => {
  return (
    <div className="flex gap-1 items-center h-full">
      {fft.map((value, index) => {
        /** Convert raw amplitude [0–4] to a percentage height [0–100]. */
        const percent = (value / 4) * 100;

        return (
          <div
            key={index}
            className="min-h-0.5 bg-primary/75 w-0.5 rounded"
            /**
             * Suppress near-silent bars below 10% to avoid visual clutter.
             * Otherwise render the bar at the computed percentage height.
             */
            style={{ height: `${percent < 10 ? 0 : percent}%` }}
          />
        );
      })}
    </div>
  );
};
