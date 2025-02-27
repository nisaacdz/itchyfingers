"use client";
import React from "react";
import ChallengesList from "./ChallengesList";
import CreateChallengeModal from "./CreateChallengeModal";
import { useAuth } from "@/context/AuthContext";

export default function Page() {
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const { user } = useAuth();

  if (!user) {
    // will be redirected shortly
    return <></>;
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
        isOpen={createModalOpen}
        onRequestClose={() => setCreateModalOpen(false)}
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
        <ChallengesList createChallenge={startCreateChallenge} />
      </div>
    </div>
  );
}
