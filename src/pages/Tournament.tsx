import { TournamentRoomOrchestrator } from "@/components/TournamentOrchestrator";
import { Toaster } from "@/components/ui/toaster";

const TournamentPage = () => {
  return (
    <>
      <TournamentRoomOrchestrator />
      <Toaster />
    </>
  );
};

export default TournamentPage;
