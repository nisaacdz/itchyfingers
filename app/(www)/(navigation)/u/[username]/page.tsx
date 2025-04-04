"use client";

import React from "react";
import {
  User,
  Mail,
  Zap,
  Target,
  Keyboard,
  Hourglass,
  Flame,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/AuthContext";
import { useParams } from "next/navigation";
import { getUser } from "@/api/requests";

const ProfileLoadingSkeleton = () => (
  <div className="max-w-6xl mx-auto p-6 space-y-8 animate-pulse">
    {/* Profile Header Skeleton */}
    <div className="flex flex-col md:flex-row gap-8 items-start">
      <div className="space-y-2 flex-1">
        <div className="h-8 bg-muted rounded w-1/2" />
        <div className="h-4 bg-muted rounded w-3/4" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 bg-card rounded-lg border">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-muted rounded-full" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
            <div className="h-8 bg-muted rounded w-3/4 mt-2" />
          </div>
        ))}
      </div>
    </div>

    {/* Challenges Section Skeleton */}
    <div className="space-y-4">
      <div className="h-8 bg-muted rounded w-1/4" />
      <div className="h-64 bg-muted rounded-lg" />
    </div>
  </div>
);

const ProfileErrorState = ({
  error,
  retry,
}: {
  error: Error;
  retry: () => void;
}) => (
  <div className="max-w-6xl mx-auto p-6">
    <div className="p-6 bg-destructive/10 border border-destructive rounded-lg flex flex-col items-center gap-4 text-center">
      <AlertCircle className="h-8 w-8 text-destructive" />
      <div>
        <h3 className="font-medium text-lg">Failed to load profile</h3>
        <p className="text-muted-foreground text-sm">{error.message}</p>
      </div>
      <button
        onClick={retry}
        className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-md text-primary-foreground transition-colors"
      >
        <RefreshCw className="h-4 w-4" />
        Try Again
      </button>
    </div>
  </div>
);

export default function Page() {
  const username = useParams().username as string;
  const { client } = useAuth();
  const {
    data: getUserResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["profile", username, client?.client_id],
    queryFn: async () => await getUser(username),
    retry: false,
  });

  if (isLoading) return <ProfileLoadingSkeleton />;
  if (!getUserResponse || getUserResponse.error || !getUserResponse.result)
    return (
      <ProfileErrorState
        error={new Error(getUserResponse?.error || "Something went wrong")}
        retry={refetch}
      />
    );

  const user = getUserResponse.result;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="space-y-2 flex-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <User className="text-primary" />
            {user.username}
          </h1>
          <p className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" />
            {user.email}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto">
          <div className="p-4 bg-card rounded-lg border">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              <span className="text-sm text-muted-foreground">Accuracy</span>
            </div>
            <div className="text-2xl font-bold mt-2">{99.5}%</div>
          </div>

          <div className="p-4 bg-card rounded-lg border">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-muted-foreground">Speed (WPM)</span>
            </div>
            <div className="text-2xl font-bold mt-2">{142}</div>
          </div>

          <div className="p-4 bg-card rounded-lg border">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-muted-foreground">
                Competitions
              </span>
            </div>
            <div className="text-2xl font-bold mt-2">{44}</div>
          </div>

          <div className="p-4 bg-card rounded-lg border">
            <div className="flex items-center gap-2">
              <Keyboard className="h-5 w-5 text-purple-500" />
              <span className="text-sm text-muted-foreground">Keystrokes</span>
            </div>
            <div className="text-2xl font-bold mt-2">{343343}</div>
          </div>
        </div>
      </div>

      {/* Challenges Table */}
      {client?.user && client.user.username === username ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Hourglass className="text-primary" />
            Challenges
          </h2>

          <div className="w-full h-full max-h-full overflow-auto">
            <p>Loading...</p>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-destructive/10 border border-destructive rounded-lg flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <div>
            <h3 className="font-medium text-lg">Failed to load profile</h3>
            <p className="text-muted-foreground text-sm">
              You must be logged in to view challenge history
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
