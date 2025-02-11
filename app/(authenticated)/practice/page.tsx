"use client";
import { useEffect, useState } from "react";
import { Participant, UserTyping } from "../../types/request";
import StatsBoard from "../../components/StatsBoard";
import ProgressBoard from "../../components/ProgressBoard";
import TypingArea from "../../components/TypingArea";
import ParticipantsRanking from "../../components/ParticipantsRanking";
import { useParams } from "next/navigation";
import { websocketAPI } from "@/app/api";

export default function Page() {
  const { challengeId } = useParams<{ challengeId: string }>();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [user, setUser] = useState<UserTyping | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [typingText, setTypingText] = useState("");

  useEffect(() => {
    websocketAPI.connect();
    websocketAPI.initializeChallengeHandlers({
      onUpdateUser: (data) => {
        setUser(data);
      },
      onUpdateZone: (data) => {
        setParticipants(data);
      },
      onError: (message) => {
        setError(true);
      },
      onEntered: (data) => {
        setParticipants(data);
        setLoading(false);
      },
      onDisconnect: () => {
        setError(true);
      },
    });

    websocketAPI.enterChallenge(challengeId);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error</div>;
  }

  if (!participants || !user) {
    return <div>Zone not found</div>;
  }

  return (
    <main className="w-full h-full p-4 pt-8 bg-background dark:bg-background">
      <div className="grid md:grid-cols-5 grid-cols-1 gap-y-4 md:gap-6">
        <div className="col-span-1 w-full h-full items-center justify-center">
          <StatsBoard user={user} text={typingText} />
        </div>
        <div className="flex flex-col gap-6 col-span-4 w-full h-full">
          <ProgressBoard
            participants={participants}
            text={typingText}
          />
          <TypingArea
            text={typingText}
            participants={participants}
            user={user}
          />
          <ParticipantsRanking
            participants={participants}
            user={user}
          />
        </div>
      </div>
    </main>
  );
}
