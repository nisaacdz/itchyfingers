import { TournamentRoomOrchestrator } from "@/components/TournamentOrchestrator";
import { useLocation, useParams } from "react-router-dom";
import { ErrorMessage } from "@/components/ErrorMessage";
import { useEffect } from "react";
import { useRoomStore } from "@/stores/roomStore";

export const TournamentPage = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const spectator = searchParams.get("spectator") === "true";
  const anonymous = searchParams.get("anonymous") === "true";

  const connect = useRoomStore((state) => state.connect);
  const disconnect = useRoomStore((state) => state.disconnect);

  useEffect(() => {
    if (tournamentId) {
      connect({ tournamentId, spectator, anonymous });
    }

    return () => {
      disconnect();
    };
  }, [tournamentId, spectator, anonymous, connect, disconnect]);

  // useEffect(() => {
  //   const handleFocus = () => socketService.ensureConnected();
  //   window.addEventListener("focus", handleFocus);
  //   return () => window.removeEventListener("focus", handleFocus);
  // }, []);

  if (!tournamentId) {
    return <ErrorMessage message={"Invalid url"} />;
  }

  return <TournamentRoomOrchestrator />;
};

export default TournamentPage;
