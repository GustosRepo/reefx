"use client";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "card" | "chart" | "avatar";
}

export function Skeleton({ className = "", variant = "text" }: SkeletonProps) {
  const variants = {
    text: "h-4 w-3/4",
    card: "h-32 w-full",
    chart: "h-48 w-full",
    avatar: "h-10 w-10 rounded-full",
  };

  return (
    <div className={`skeleton ${variants[variant]} ${className}`} />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="skeleton h-10 w-48" />
        <div className="skeleton h-4 w-64" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card rounded-xl p-5 space-y-3">
            <div className="flex justify-between">
              <div className="skeleton h-10 w-10 rounded-lg" />
              <div className="skeleton h-6 w-16" />
            </div>
            <div className="skeleton h-3 w-20" />
            <div className="skeleton h-8 w-24" />
          </div>
        ))}
      </div>

      {/* Charts grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card rounded-xl p-6 space-y-4">
            <div className="skeleton h-5 w-32" />
            <div className="skeleton h-44 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-card rounded-xl p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div className="skeleton h-8 w-8 rounded-lg" />
        <div className="skeleton h-5 w-20" />
      </div>
      <div className="skeleton h-3 w-24" />
      <div className="skeleton h-8 w-16" />
    </div>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="glass-card rounded-lg p-4 flex items-center gap-4">
          <div className="skeleton h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-1/3" />
            <div className="skeleton h-3 w-1/2" />
          </div>
          <div className="skeleton h-8 w-20 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="skeleton h-4 w-24" />
          <div className="skeleton h-12 w-full rounded-lg" />
        </div>
      ))}
      <div className="skeleton h-12 w-full rounded-lg" />
    </div>
  );
}
