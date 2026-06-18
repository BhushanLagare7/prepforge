"use client";

import { ReactNode, useRef, useState } from "react";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { DeepPartial } from "ai";
import {
  AlertCircleIcon,
  CheckCircleIcon,
  UploadIcon,
  XCircleIcon,
} from "lucide-react";
import { toast } from "sonner";
import z from "zod";

import Skeleton from "@/components/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { cn } from "@/lib/utils";
import { aiAnalyzeSchema } from "@/services/ai/resumes/schemas";

interface ResumePageClientProps {
  jobInfoId: string;
}

export const ResumePageClient = ({ jobInfoId }: ResumePageClientProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileRef = useRef<File | null>(null);

  const {
    object: aiAnalysis,
    isLoading,
    submit: generateAnalysis,
  } = useObject({
    api: "/api/ai/resumes/analyze",
    schema: aiAnalyzeSchema,
    fetch: (url, options) => {
      const headers = new Headers(options?.headers);
      headers.delete("Content-Type");

      const formData = new FormData();
      if (fileRef.current) {
        formData.append("resumeFile", fileRef.current);
      }
      formData.append("jobInfoId", jobInfoId);

      return fetch(url, { ...options, headers, body: formData });
    },
  });

  function handleFileUpload(file: File | null) {
    fileRef.current = file;
    if (file == null) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF, Word document, or text file");
      return;
    }

    generateAnalysis(null);
  }

  return (
    <div className="space-y-8 w-full">
      <Card>
        <CardHeader>
          <CardTitle>
            {isLoading ? "Analyzing your resume" : "Upload your resume"}
          </CardTitle>
          <CardDescription>
            {isLoading
              ? "This may take a couple minutes"
              : "Get personalized feedback on your resume based on the job"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingSwap isLoading={isLoading} loadingIconClassName="size-16">
            <div
              className={cn(
                "relative p-6 mt-2 rounded-lg border-2 border-dashed transition-colors",
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/50 bg-muted/10",
              )}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragOver(false);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                handleFileUpload(e.dataTransfer.files[0] ?? null);
              }}
            >
              <label className="sr-only" htmlFor="resume-upload">
                Upload your resume
              </label>
              <input
                accept=".pdf,.doc,.docx,.txt"
                className="absolute inset-0 opacity-0 cursor-pointer"
                id="resume-upload"
                type="file"
                onChange={(e) => {
                  handleFileUpload(e.target.files?.[0] ?? null);
                }}
              />
              <div className="flex flex-col gap-4 justify-center items-center text-center">
                <UploadIcon className="size-12 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-lg">
                    Drag your resume here or click to upload
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supported formats: PDF, Word docs, and text files
                  </p>
                </div>
              </div>
            </div>
          </LoadingSwap>
        </CardContent>
      </Card>

      <AnalysisResults aiAnalysis={aiAnalysis} isLoading={isLoading} />
    </div>
  );
};

type Keys = Exclude<keyof z.infer<typeof aiAnalyzeSchema>, "overallScore">;

interface AnalysisResultsProps {
  aiAnalysis: DeepPartial<z.infer<typeof aiAnalyzeSchema>> | undefined;
  isLoading: boolean;
}

const AnalysisResults = ({ aiAnalysis, isLoading }: AnalysisResultsProps) => {
  if (!isLoading && aiAnalysis == null) return null;

  const sections: Record<Keys, string> = {
    ats: "ATS Compatibility",
    jobMatch: "Job Match",
    writingAndFormatting: "Writing and Formatting",
    keywordCoverage: "Keyword Coverage",
    other: "Additional Insights",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Results</CardTitle>
        <CardDescription>
          {aiAnalysis?.overallScore == null ? (
            <Skeleton className="w-32" />
          ) : (
            `Overall Score: ${aiAnalysis.overallScore}/10`
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple">
          {Object.entries(sections).map(([key, title]) => {
            const category = aiAnalysis?.[key as Keys];

            return (
              <AccordionItem key={key} value={title}>
                <AccordionTrigger>
                  <CategoryAccordionHeader
                    score={category?.score}
                    title={title}
                  />
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="text-muted-foreground">
                      {category?.summary == null ? (
                        <span className="space-y-2">
                          <Skeleton />
                          <Skeleton className="w-3/4" />
                        </span>
                      ) : (
                        category.summary
                      )}
                    </div>
                    <div className="space-y-3">
                      {category?.feedback == null ? (
                        <>
                          <Skeleton className="h-16" />
                          <Skeleton className="h-16" />
                          <Skeleton className="h-16" />
                        </>
                      ) : (
                        category.feedback.map((item, index) => {
                          if (item == null) return null;

                          return <FeedbackItem key={index} {...item} />;
                        })
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
};

interface CategoryAccordionHeaderProps {
  title: string;
  score: number | undefined | null;
}

const CategoryAccordionHeader = ({
  title,
  score,
}: CategoryAccordionHeaderProps) => {
  let badge: ReactNode;
  if (score == null) {
    badge = <Skeleton className="w-16" />;
  } else if (score >= 8) {
    badge = <Badge>Excellent</Badge>;
  } else if (score >= 6) {
    badge = <Badge variant="warning">Ok</Badge>;
  } else {
    badge = <Badge variant="destructive">Needs Works</Badge>;
  }

  return (
    <div className="flex justify-between items-start w-full">
      <div className="flex flex-col gap-1 items-start">
        <span>{title}</span>
        <div className="no-underline">{badge}</div>
      </div>
      {score == null ? <Skeleton className="w-12" /> : `${score}/10`}
    </div>
  );
};

const FeedbackItem = ({
  message,
  name,
  type,
}: Partial<z.infer<typeof aiAnalyzeSchema>["ats"]["feedback"][number]>) => {
  if (name == null || message == null || type == null) return null;

  const getColors = () => {
    switch (type) {
      case "strength":
        return "bg-primary/10 border border-primary/50";
      case "major-improvement":
        return "bg-destructive/10 dark:bg-destructive/20 border border-destructive/50 dark:border-destructive/70";
      case "minor-improvement":
        return "bg-warning/10 border border-warning/40";
      default:
        throw new Error(`Unknown feedback type: ${type satisfies never}`);
    }
  };

  const getIcon = () => {
    switch (type) {
      case "strength":
        return <CheckCircleIcon className="size-4 text-primary" />;
      case "minor-improvement":
        return <AlertCircleIcon className="size-4 text-warning" />;
      case "major-improvement":
        return <XCircleIcon className="size-4 text-destructive" />;
      default:
        throw new Error(`Unknown feedback type: ${type satisfies never}`);
    }
  };

  return (
    <div
      className={cn(
        "flex gap-3 items-baseline py-5 pr-5 pl-3 rounded-lg",
        getColors(),
      )}
    >
      <div>{getIcon()}</div>
      <div className="flex flex-col gap-1">
        <div className="text-base">{name}</div>
        <div className="text-muted-foreground">{message}</div>
      </div>
    </div>
  );
};
