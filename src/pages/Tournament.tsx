import { TournamentRoomOrchestrator } from "@/components/TournamentOrchestrator";
import { useLocation, useParams } from "react-router-dom";
import { ErrorMessage } from "@/components/ErrorMessage";
import { useEffect } from "react";
import { connect, disconnect } from "@/stores/roomStore";
import { socketService } from "@/api/socketService";

export const TournamentPage = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const spectator = searchParams.get("spectator") === "true";
  const anonymous = searchParams.get("anonymous") === "true";

  useEffect(() => {
    if (tournamentId) {
      connect({ tournamentId, spectator, anonymous });
    }

    return () => {
      disconnect();
    };
  }, [tournamentId, spectator, anonymous]);

  useEffect(() => {
    const handleFocus = () => socketService.ensureConnected();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  if (!tournamentId) {
    return <ErrorMessage message={"Invalid url"} />;
  }

  return <TournamentRoomOrchestrator />;
};

export default TournamentPage;
