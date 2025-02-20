import ChallengesList from "../../components/ChallengesList";
import React from "react";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-start w-full h-full p-8 bg-background">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-card-foreground text-center">
          Active Challenges
        </h2>
        <p className="text-muted-foreground">
          Join community challenges and compete with others
        </p>
      </div>
      <div className="w-full h-full max-h-full overflow-auto">
        <ChallengesList />
      </div>
    </div>
  );
}
