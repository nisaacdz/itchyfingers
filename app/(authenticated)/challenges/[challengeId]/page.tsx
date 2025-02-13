"use client";
import React, { useEffect, useState } from "react";
import {
  Challenge,
  DefaultUserTyping,
  Participant,
  UserTyping,
} from "../../../types/request";
import StatsBoard from "../../../components/StatsBoard";
import ProgressBoard from "../../../components/ProgressBoard";
import {
  TypingArea,
  TypingAreaCountdown,
} from "../../../components/TypingArea";
import ParticipantsRanking from "../../../components/ParticipantsRanking";
import { useParams } from "next/navigation";
import { fetchChallenge, getTypingText, websocketAPI } from "../../../api";
import { toast } from "@/app/util/toast";

const handleCharacterInput = (char: string) => {
  websocketAPI.sendTypingInput(char);
};

export default function Page() {
  const { challengeId } = useParams<{ challengeId: string }>();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [participants, setParticipants] = useState<Participant[] | null>(null);
  const [user, setUser] = useState<UserTyping>(DefaultUserTyping);
  const [error, setError] = useState<string | null>(null);
  const [typingText, setTypingText] = useState<string | null>(null);

  useEffect(() => {
    retry();
  }, []);

  const retry = async () => {
    websocketAPI.initializeChallengeHandlers({
      onUpdateUser: (data) => {
        console.log("user-update received", data);
        setUser(data);
      },
      onUpdateZone: (data) => {
        setParticipants(data);
      },
      onStartChallenge: (text) => {
        setTypingText(text);
      },
      onError: (message) => {
        setError(message);
      },
      onEntered: (participant) => {
        toast("success", `${participant.username} just joined the challenge`);
      },
      onLeft: (participant) => {
        toast("success", `${participant.username} just left the challenge`);
      },
      onDisconnect: () => {
        //setError("Disconnected from server");
      },
    });
    websocketAPI.connect();
    websocketAPI.enterChallenge(challengeId);

    fetchChallenge(challengeId)
      .then((challenge) => {
        setChallenge(challenge);
        console.log(challenge.startedAt);
        if (challenge.startedAt) {
          getTypingText(challengeId)
            .then(setTypingText)
            .catch((error) => setError(error.message));
        }
      })
      .catch((error) => setError(error.message));
  };

  const loading = !challenge;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <main className="w-full h-full p-4 pt-8 bg-background dark:bg-background">
      <div className="grid md:grid-cols-5 grid-cols-1 gap-y-4 md:gap-6">
        <div className="col-span-1 w-full h-full items-center justify-center">
          <StatsBoard user={user} textLength={typingText?.length || 0} />
        </div>
        <div className="flex flex-col gap-6 col-span-4 w-full h-full">
          <ProgressBoard
            participants={participants ?? []}
            textLength={typingText?.length || 0}
          />
          {typingText ? (
            <TypingArea
              text={typingText}
              participants={participants ?? []}
              user={user}
              handleCharacterInput={handleCharacterInput}
            />
          ) : (
            <TypingAreaCountdown
              scheduledAt={new Date(challenge.scheduledAt)}
            />
          )}
          <ParticipantsRanking participants={participants ?? []} user={user} />
        </div>
      </div>
    </main>
  );
}
