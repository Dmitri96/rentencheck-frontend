import { cn } from "@/lib/utils";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

/*
 * Skeleton — static muted block, not a pulsing shimmer.
 * The brief replaces busy pulse loaders with a thin top progress bar
 * (see ProgressBar) for global loading; static skeletons preserve layout
 * without drawing the eye.
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return <div className={cn("rounded-md bg-muted/70", className)} {...props} />;
}
