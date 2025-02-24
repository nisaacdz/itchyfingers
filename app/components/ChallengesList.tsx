"use client";

import React from "react";
import {
  Globe,
  User,
  Hourglass,
  ChevronLeft,
  ChevronRight,
  Users,
  Keyboard,
  Unlock,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ChallengePrivacy } from "../types/request";
import { enterChallenge, fetchChallenges } from "../api";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useQueryState, parseAsInteger } from "nuqs";

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours}h ${minutes}m ${remainingSeconds}s`
    .replace(/\b0h\s?|0m\s?|0s\b/gi, "")
    .trim();
};

const formatTimeRemaining = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);

  if (diffInSeconds < 0) return "Started";
  if (diffInSeconds < 60) return `${diffInSeconds}s`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  return `${Math.floor(diffInSeconds / 86400)}d`;
};

const ChallengesList = () => {
  const [page, setPage] = useQueryState<number>(
    "page",
    parseAsInteger.withDefault(1),
  );
  const [pageSize, setPageSize] = useQueryState<number>(
    "pageSize",
    parseAsInteger.withDefault(15),
  );
  const router = useRouter();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["challenges", page, pageSize],
    queryFn: () => fetchChallenges({ pageParam: page, pageSize }),
  });

  const handlePrevious = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () =>
    setPage((p) => Math.min(data?.totalPages || p, p + 1));

  const enterCompetion = (challengeId: string) => {
    enterChallenge(challengeId)
      .then((challenge) => {
        router.push(`/challenges/${challenge.challengeId}`);
      })
      .catch((e) => toast.error(e.message));
  };

  if (isError) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive-foreground max-w-4xl mx-auto">
        <p>Error: {(error as Error)?.message || "Failed to load challenges"}</p>
        <button
          className="mt-2 px-4 py-2 bg-accent/10 hover:bg-accent/20 rounded-md text-foreground"
          onClick={() => refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 space-y-6 max-w-3xl mx-auto">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-12 items-center gap-4 p-2 bg-card rounded-lg border border-border"
          >
            <div className="col-span-1 flex items-center justify-center min-w-[40px]">
              <Skeleton className="rounded-full h-5 w-5" />
            </div>
            <div className="col-span-2 flex items-center justify-start gap-2 min-w-[150px]">
              <Skeleton className="rounded-md h-4 w-24" />
            </div>
            <div className="col-span-2 flex items-center justify-start gap-2 min-w-[150px]">
              <Skeleton className="rounded-md h-4 w-24" />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <Skeleton className="rounded-md h-4 w-16" />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <Skeleton className="rounded-md h-4 w-8" />
            </div>
            <div className="col-span-3">
              <Skeleton className="rounded-md h-8 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-3xl mx-auto">
      <div className="space-y-2">
        {data?.challenges?.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No challenges available
          </div>
        ) : (
          data?.challenges?.map((challenge) => (
            <div
              key={challenge.challengeId}
              className="grid grid-cols-12 items-center gap-4 p-2 bg-card rounded-lg border border-border hover:shadow-sm hover:bg-muted transition-shadow"
            >
              <div
                className="flex items-center justify-center min-w-[40px]"
                title={
                  challenge.privacy === ChallengePrivacy.Open
                    ? "Open Challenge"
                    : "You're Invited"
                }
              >
                {challenge.privacy === ChallengePrivacy.Open ? (
                  <Globe size={20} className="text-primary" />
                ) : (
                  <Unlock size={20} className="text-destructive" />
                )}
              </div>

              <div
                className=" col-span-3 flex items-center justify-start gap-2 min-w-[150px]"
                title={`Creator: ${challenge.createdBy.username}`}
              >
                <User size={16} className="text-muted-foreground" />
                <span className="text-sm text-foreground">
                  {challenge.createdBy.username}
                </span>
              </div>

              <div
                className="col-span-2 flex items-center justify-start gap-2 min-w-[150px]"
                title={`Starts in ${formatTimeRemaining(new Date(challenge.scheduledAt))}`}
              >
                <Hourglass size={16} className="text-muted-foreground" />
                <span className="text-sm text-foreground">
                  {formatTimeRemaining(new Date(challenge.scheduledAt))}
                </span>
              </div>

              <div
                className="col-span-2 flex items-center gap-2"
                title="Duration"
              >
                <Keyboard size={16} className="text-muted-foreground" />
                <span className="text-sm text-foreground">
                  {formatDuration(challenge.duration)}
                </span>
              </div>

              <div
                className="col-span-2 flex items-center gap-2"
                title={`${challenge.participants} participants`}
              >
                <Users size={16} className="text-muted-foreground" />
                <span className="text-sm text-foreground">
                  {challenge.participants}
                </span>
              </div>

              <button
                className="col-span-2 border border-muted-foreground rounded-md px-3 py-1 hover:bg-primary/10"
                title="Enter competition"
                onClick={() => enterCompetion(challenge.challengeId)}
              >
                Enter
              </button>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="bg-input border border-border rounded-md px-2 py-1 text-sm text-foreground"
          >
            {[10, 15, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-sm text-muted-foreground">Page size</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            disabled={page === 1}
            className="p-2 border border-border rounded-md hover:bg-accent/10 disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="text-foreground" />
          </button>

          <span className="text-sm text-foreground">
            Page {page} of {data?.totalPages || 1}
          </span>

          <button
            onClick={handleNext}
            disabled={page === (data?.totalPages || 1)}
            className="p-2 border border-border rounded-md hover:bg-accent/10 disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <ChevronRight className="text-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChallengesList;
