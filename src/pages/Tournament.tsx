import { TournamentRoom, useRoom } from "@/hooks/useRoom";
import { TournamentRoomOrchestrator } from "@/components/TournamentOrchestrator";
import { useLocation, useParams } from "react-router-dom";
import { ErrorMessage } from "@/components/ErrorMessage";
import { useEffect } from "react";
import { socketService } from "@/api/socketService";

export const TournamentPage = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const spectator = searchParams.get("spectator") === "true";
  const anonymous = searchParams.get("anonymous") === "true";

  useEffect(() => {
    const handleFocus = (_: FocusEvent) => {
      socketService.ensureConnected();
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  if (!tournamentId || typeof tournamentId != "string") {
    return <ErrorMessage message={"Invalid url"} />
  }

  return (
    <TournamentRoom
      tournamentId={tournamentId}
      spectator={spectator}
      anonymous={anonymous}
    >
      <TournamentRoomOrchestrator />
    </TournamentRoom>
  );
};

export default TournamentPage;