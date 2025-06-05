"use client";
import { useEffect, useState } from "react";
import { ZoneData } from "@/types/request";
import { StatsBoard } from "@/components/custom/StatsBoard";
import ProgressBoard from "@/components/custom/ProgressBoard";
import { TypingArea } from "@/components/custom/TypingArea";
import {
  getTypingText,
  getEverything,
  initialize,
  getZoneData,
  handleTypedCharacters,
} from "@/api/dummy_api";
import ParticipantsRanking from "@/components/custom/ParticipantsRanking";
import { handleExitZone, handleRestartZone } from "@/api/dummy_api";

export default function Page() {
  const [zoneData, setZoneData] = useState<ZoneData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [typingText, setTypingText] = useState("");

  useEffect(() => {
    initialize(() => {
      setZoneData(getZoneData());
    });
    setTypingText(getTypingText());
    const { zoneData, loading, error } = getEverything();
    setLoading(loading);
    setError(error);
    setZoneData(zoneData);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error</div>;
  }

  if (!zoneData) {
    return <div>Zone not found</div>;
  }

  return (
    <main className="w-full h-full p-4 pt-8 bg-background dark:bg-background">
      <div className="grid md:grid-cols-5 grid-cols-1 gap-y-4 md:gap-6">
        <div className="col-span-1 w-full h-full items-center justify-center">
          <StatsBoard
            currentParticipant={zoneData.participants[zoneData.userId]}
            textLength={typingText.length}
            onLeave={handleExitZone}
            onRestart={handleRestartZone}
          />
        </div>
        <div className="flex flex-col gap-6 col-span-4 w-full h-full">
          <ProgressBoard
            participants={zoneData.participants}
            textLength={typingText.length}
          />
          <TypingArea
            text={typingText}
            participants={zoneData.participants}
            clientId={zoneData.userId}
            handleCharacterInput={handleTypedCharacters}
          />
          <ParticipantsRanking
            participants={zoneData.participants}
            clientId={zoneData.userId}
            tournamentStartTime={zoneData.startTime}
          />
        </div>
      </div>
    </main>
  );
}
