import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

const Skeleton = ({ className }: SkeletonProps) => {
  return (
    <span
      className={cn(
        "animate-pulse bg-muted rounded h-[1.25em] w-full max-w-full inline-block align-bottom",
        className,
      )}
    />
  );
};

export const SkeletonButton = ({ className }: SkeletonProps) => {
  return <Skeleton className={cn("h-9", className)} />;
};

export default Skeleton;
