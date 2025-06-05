"use client";
import { useState } from "react";
import TournamentsList from "@/components/custom/TournamentsList";
import CreateChallengeModal from "@/components/custom/CreateTournamentModal";
import { useAuth } from "@/hooks/AuthContext";
import { AuthLoader } from "@/components/custom/AuthLoader";

export default function Page() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const { loading } = useAuth();

  if (loading) {
    return <AuthLoader />;
  }

  const startCreateChallenge = () => {
    setCreateModalOpen(true);
  };

  return (
    <div
      className="flex flex-col items-center justify-start w-full h-full p-8 bg-background"
      id="challenges-page"
    >
      <CreateChallengeModal
        open={createModalOpen}
        onOpenChange={(state) => setCreateModalOpen(state)}
      />
      <div className="w-full max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-card-foreground">
              Active Challenges
            </h2>
            <p className="text-muted-foreground">
              Join community challenges and compete with others
            </p>
          </div>
        </div>
        <TournamentsList createChallenge={startCreateChallenge} />
      </div>
    </div>
  );
}
