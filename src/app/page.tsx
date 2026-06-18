import { Suspense } from "react";
import Link from "next/link";

import { SignInButton } from "@clerk/nextjs";
import {
  BookOpenCheckIcon,
  Brain,
  BrainCircuitIcon,
  FileSlidersIcon,
  SpeechIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserAvatar } from "@/features/users/components/user-avatar";
import { PricingTable } from "@/services/clerk/components/pricing-table";
import { getCurrentUser } from "@/services/clerk/lib/get-current-user";

const LandingPage = () => {
  return (
    <div className="bg-linear-to-b from-background to-muted/20">
      <Navbar />
      <Hero />
      <Features />
      <DetailedFeatures />
      <Stats />
      <Testimonials />
      <Pricing />
      <Footer />
    </div>
  );
};

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 border-b backdrop-blur-md border-border bg-card/80">
      <div className="container">
        <div className="flex justify-between items-center h-16">
          <div className="flex gap-2 items-center">
            <BrainCircuitIcon className="size-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">PrepForge</h1>
          </div>
          <Suspense
            fallback={
              <SignInButton forceRedirectUrl="/app">
                <Button variant="outline">Sign In</Button>
              </SignInButton>
            }
          >
            <NavButton />
          </Suspense>
        </div>
      </div>
    </nav>
  );
};

const NavButton = async () => {
  const { userId } = await getCurrentUser();

  if (userId == null) {
    return (
      <SignInButton forceRedirectUrl="/app">
        <Button variant="outline">Sign In</Button>
      </SignInButton>
    );
  }

  return (
    <Button asChild>
      <Link href="/app">Dashboard</Link>
    </Button>
  );
};

const Hero = () => {
  return (
    <section className="overflow-hidden relative py-20 sm:py-32">
      <div className="container">
        <div className="text-center">
          <h2 className="mb-6 text-4xl font-bold leading-tight sm:text-6xl text-foreground">
            Land your dream job with{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-primary/60 text-nowrap">
              AI-powered
            </span>{" "}
            job preparation
          </h2>
          <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-muted-foreground">
            Skip the guesswork and accelerate your job search. Our AI platform
            eliminates interview anxiety, optimizes your resume, and gives you
            the technical edge to land offers faster.
          </p>
          <Button asChild className="px-6 h-12 text-base" size="lg">
            <Link href="/app">Get Started for Free</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  const features = [
    {
      title: "AI Interview Practice",
      Icon: SpeechIcon,
      description:
        "Simulate real interviews with AI that adapts to your responses. Build confidence and eliminate nervousness before the big day.",
    },
    {
      title: "Tailored Resume Suggestions",
      Icon: FileSlidersIcon,
      description:
        "Transform your resume into an ATS-friendly, recruiter-approved document that gets you more callbacks.",
    },
    {
      title: "Technical Question Practice",
      Icon: BookOpenCheckIcon,
      description:
        "Solve coding problems with guided hints and explanations. Perfect your approach to technical interviews.",
    },
  ];
  return (
    <section className="py-20">
      <div className="container">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="transition-all duration-300 transform hover:-translate-y-1"
            >
              <CardHeader className="pb-4">
                <div className="flex justify-center items-center mb-4 w-16 h-16 rounded-lg bg-primary/10">
                  <feature.Icon className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold text-card-foreground">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

const DetailedFeatures = () => {
  return (
    <section className="py-20 bg-muted/20">
      <div className="container">
        <div className="mb-16 text-center">
          <h3 className="mb-4 text-3xl font-bold sm:text-4xl text-foreground">
            Everything you need to{" "}
            <span className="text-primary">ace your interviews</span>
          </h3>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Get hands-on experience with real interview scenarios, personalized
            feedback, and industry-proven strategies
          </p>
        </div>

        <div className="space-y-20">
          {/* AI Interview Practice */}
          <div className="grid grid-cols-1 gap-12 items-center lg:grid-cols-2">
            <div>
              <div className="flex gap-3 items-center mb-6">
                <div className="flex justify-center items-center w-12 h-12 rounded-lg bg-primary/10">
                  <SpeechIcon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-2xl font-bold text-foreground">
                  AI Interview Practice
                </h4>
              </div>
              <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
                Practice with our advanced AI interviewer that adapts to your
                responses and provides real-time feedback. Experience realistic
                interview scenarios for behavioral, technical, and case study
                questions.
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3 items-center">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  Real-time voice interaction with AI interviewer
                </li>
                <li className="flex gap-3 items-center">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  Personalized feedback on communication style
                </li>
                <li className="flex gap-3 items-center">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  Industry-specific question banks
                </li>
                <li className="flex gap-3 items-center">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  Progress tracking and improvement metrics
                </li>
              </ul>
            </div>
            <div className="p-6 rounded-2xl border shadow-lg bg-card border-border">
              <div className="p-4 mb-4 rounded-lg bg-muted/50">
                <div className="flex gap-3 items-center mb-3">
                  <div className="flex justify-center items-center w-8 h-8 rounded-full bg-primary/20">
                    <Brain className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    AI Interviewer
                  </span>
                </div>
                <p className="text-sm italic text-muted-foreground">
                  &quot;Tell me about a time when you had to work with a
                  difficult team member...&quot;
                </p>
              </div>
              <div className="p-4 rounded-lg bg-primary/5">
                <div className="flex gap-3 items-center mb-3">
                  <div className="flex justify-center items-center w-8 h-8 rounded-full bg-primary/20">
                    <span className="text-xs font-bold text-primary">You</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    Your Response
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  &quot;In my previous role, I worked with a colleague who
                  consistently missed deadlines...&quot;
                </p>
                <div className="flex gap-2 items-center mt-3">
                  <span className="px-2 py-1 text-xs rounded-full bg-primary/20 text-primary">
                    Strong storytelling
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-primary/20 text-primary">
                    Good structure
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Resume Optimization */}
          <div className="grid grid-cols-1 gap-12 items-center lg:grid-cols-2">
            <div className="lg:order-2">
              <div className="flex gap-3 items-center mb-6">
                <div className="flex justify-center items-center w-12 h-12 rounded-lg bg-primary/10">
                  <FileSlidersIcon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-2xl font-bold text-foreground">
                  Smart Resume Analysis
                </h4>
              </div>
              <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
                Transform your resume with AI-powered suggestions that optimize
                for ATS systems and recruiter preferences. Get specific,
                actionable feedback tailored to your target role and industry.
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3 items-center">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  ATS compatibility scoring and optimization
                </li>
                <li className="flex gap-3 items-center">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  Job description matching analysis
                </li>
                <li className="flex gap-3 items-center">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  Industry-specific keyword suggestions
                </li>
                <li className="flex gap-3 items-center">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  Before/after impact measurement
                </li>
              </ul>
            </div>
            <div className="p-6 rounded-2xl border shadow-lg lg:order-1 bg-card border-border">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-foreground">
                    Resume Score
                  </span>
                  <span className="text-2xl font-bold text-primary">87%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: "87%" }}
                  ></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-foreground">
                    ATS Compatibility
                  </span>
                  <span className="text-sm font-medium text-primary">
                    Excellent
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-foreground">Keyword Match</span>
                  <span className="text-sm font-medium text-primary">92%</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-foreground">
                    Impact Statements
                  </span>
                  <span className="text-sm font-medium text-primary">Good</span>
                </div>
              </div>
              <div className="p-3 mt-4 rounded-lg bg-primary/10">
                <p className="mb-1 text-xs font-medium text-primary">
                  💡 Suggestion
                </p>
                <p className="text-xs text-muted-foreground">
                  Add 2 more quantified achievements to increase impact score
                </p>
              </div>
            </div>
          </div>

          {/* Technical Questions */}
          <div className="grid grid-cols-1 gap-12 items-center lg:grid-cols-2">
            <div>
              <div className="flex gap-3 items-center mb-6">
                <div className="flex justify-center items-center w-12 h-12 rounded-lg bg-primary/10">
                  <BookOpenCheckIcon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-2xl font-bold text-foreground">
                  Technical Interview Prep
                </h4>
              </div>
              <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
                Master coding interviews with our comprehensive practice
                platform. Get step-by-step guidance, hints, and detailed
                explanations for problems across all difficulty levels and
                topics.
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3 items-center">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  1000+ curated coding problems
                </li>
                <li className="flex gap-3 items-center">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  Real-time code execution and testing
                </li>
                <li className="flex gap-3 items-center">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  AI-powered hints and explanations
                </li>
                <li className="flex gap-3 items-center">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  Company-specific question patterns
                </li>
              </ul>
            </div>
            <div className="p-6 rounded-2xl border shadow-lg bg-card border-border">
              <div className="p-4 mb-4 rounded-lg bg-muted/50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">
                    Two Sum
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-primary/20 text-primary">
                    Easy
                  </span>
                </div>
                <p className="mb-3 text-xs text-muted-foreground">
                  Given an array of integers, return indices of two numbers that
                  add up to target.
                </p>
                <div className="p-2 font-mono text-xs rounded bg-background">
                  <span className="text-primary">def</span>{" "}
                  <span className="text-foreground">twoSum</span>(
                  <span className="text-primary">nums, target</span>):
                  <br />
                  &nbsp;&nbsp;
                  <span className="text-muted-foreground">
                    # Your solution here
                  </span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                <span className="text-primary">✓</span> 3/5 test cases passed
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Stats = () => {
  const stats = [
    {
      value: "2.3x",
      label: "Faster job placement",
      description:
        "Our users land offers in 4-6 weeks vs industry average of 12+ weeks",
    },
    {
      value: "65%",
      label: "Fewer interviews needed",
      description:
        "Average 3-4 interviews to land an offer vs typical 8-10 interviews",
    },
    {
      value: "89%",
      label: "Interview success rate",
      description:
        "Users who complete our prep program receive offers at 9/10 interviews",
    },
    {
      value: "$15K+",
      label: "Higher starting salaries",
      description:
        "Better negotiation skills lead to significantly higher compensation",
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="mb-16 text-center">
          <h3 className="mb-4 text-3xl font-bold sm:text-4xl text-foreground">
            Our users land jobs{" "}
            <span className="text-primary">faster and better</span>
          </h3>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Don&apos;t just take our word for it. See how PrepForge users
            consistently outperform the competition in every metric that
            matters.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="p-6 text-center rounded-2xl border backdrop-blur-sm transition-all duration-300 bg-card/60 border-border/50 hover:bg-card/80"
            >
              <div className="mb-2 text-4xl font-bold sm:text-5xl text-primary">
                {stat.value}
              </div>
              <div className="mb-3 text-lg font-semibold text-foreground">
                {stat.label}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="mb-8 text-sm text-muted-foreground text-pretty">
            * Based on internal data from 2,500+ successful job placements in
            2024
          </p>
          <Button asChild className="px-6 h-12" size="lg">
            <Link href="/app">Join thousands of successful job seekers</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer",
      company: "Google",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=64&h=64&fit=crop&crop=face&auto=format&q=80",
      content:
        "PrepForge completely transformed my interview preparation. The AI practice sessions felt so realistic that I walked into my Google interview feeling completely confident. Landed the offer on my first try!",
      timeToOffer: "3 weeks",
    },
    {
      name: "Marcus Rodriguez",
      role: "Product Manager",
      company: "Stripe",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face&auto=format&q=80",
      content:
        "I was struggling with behavioral questions until I found PrepForge. The AI helped me craft compelling stories and practice my delivery. Got offers from 3 different companies!",
      timeToOffer: "5 weeks",
    },
    {
      name: "Emily Park",
      role: "Data Scientist",
      company: "Netflix",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face&auto=format&q=80",
      content:
        "The resume optimization feature was a game-changer. My callback rate tripled after implementing PrepForge&apos;s suggestions. Worth every penny and more.",
      timeToOffer: "4 weeks",
    },
    {
      name: "Alex Thompson",
      role: "Frontend Developer",
      company: "Airbnb",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face&auto=format&q=80",
      content:
        "The technical question practice was incredible. I went from failing coding interviews to acing them. The AI&apos;s feedback helped me identify and fix my weak spots immediately.",
      timeToOffer: "2 weeks",
    },
    {
      name: "Priya Patel",
      role: "UX Designer",
      company: "Figma",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=face&auto=format&q=80",
      content:
        "I was career-changing into tech and felt overwhelmed. PrepForge&apos;s personalized guidance gave me the confidence to pursue design roles. Now I&apos;m living my dream at Figma!",
      timeToOffer: "6 weeks",
    },
    {
      name: "David Kim",
      role: "DevOps Engineer",
      company: "AWS",
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop&crop=face&auto=format&q=80",
      content:
        "The salary negotiation tips alone paid for the platform 10x over. I increased my offer by $25K just by following PrepForge&apos;s guidance. Absolutely worth it!",
      timeToOffer: "4 weeks",
    },
  ];

  return (
    <section className="py-20">
      <div className="container">
        <div className="mb-16 text-center">
          <h3 className="mb-4 text-3xl font-bold sm:text-4xl text-foreground text-balance">
            Success stories from{" "}
            <span className="text-primary">real users</span>
          </h3>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground text-pretty">
            Join thousands of professionals who&apos;ve accelerated their
            careers with PrepForge
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="overflow-hidden relative h-full transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
            >
              <CardContent className="flex flex-col p-6 h-full">
                <div className="flex gap-3 items-center mb-4">
                  <UserAvatar
                    className="size-10 shrink-0"
                    user={{
                      imageUrl: testimonial.avatar,
                      name: testimonial.name,
                    }}
                  />
                  <div>
                    <div className="font-semibold text-foreground">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </div>
                  </div>
                </div>

                <blockquote className="mb-4 italic leading-relaxed text-muted-foreground grow">
                  &quot;{testimonial.content}&quot;
                </blockquote>

                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium text-primary">
                    @{testimonial.company}
                  </div>
                  <div className="px-2 py-1 text-xs rounded-full text-muted-foreground bg-muted/50">
                    Hired in {testimonial.timeToOffer}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="mb-6 text-muted-foreground">
            Ready to write your own success story?
          </p>
          <Button asChild className="px-8 h-12" size="lg">
            <Link href="/app">Start Your Journey Today</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

const Pricing = () => {
  return (
    <section className="py-20 bg-muted/20">
      <div className="container">
        <div className="mb-16 text-center">
          <h3 className="mb-4 text-3xl font-bold sm:text-4xl text-foreground">
            Choose your{" "}
            <span className="text-primary">career acceleration</span> plan
          </h3>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Invest in your future with flexible pricing options designed to fit
            your career goals and budget
          </p>
        </div>

        <div className="mx-auto max-w-5xl">
          <PricingTable />
        </div>

        <div className="mt-12 text-center">
          <p className="mb-4 text-sm text-muted-foreground">
            All plans include a 7-day refund period. Cancel anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="py-6 border-t bg-card border-border">
      <div className="container">
        <div className="text-center">
          <p className="text-muted-foreground">
            Empowering your career journey with AI-powered job preparation
            tools.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingPage;
