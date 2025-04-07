"use client";
import TournamentsList from "@/components/custom/TournamentsList";
import { useAuth } from "@/context/AuthContext";
import { ContentLoader } from "@/components/custom/ContentLoader";

export default function Page() {
  const { loading } = useAuth();

  if (loading) {
    return <ContentLoader />;
  }

  return (
    <div
      className="flex flex-col items-center justify-start w-full h-full p-8 bg-background"
      id="challenges-page"
    >
      <div className="w-full max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-card-foreground">
              Active Tournaments
            </h2>
            <p className="text-muted-foreground">
              Join open tournaments and compete with others
            </p>
          </div>
        </div>
        <TournamentsList />
      </div>
    </div>
  );
}
