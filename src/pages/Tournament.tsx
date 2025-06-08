import { TournamentRoomOrchestrator } from "@/components/TournamentOrchestrator";
import { Toaster } from "@/components/ui/toaster"; // Shadcn Toaster

// This component assumes it's rendered by a React Router Route
// e.g., <Route path="/tournaments/:tournamentId" element={<TournamentPage />} />

const TournamentPage = () => {
  // The TournamentRoomOrchestrator will internally use useParams to get tournamentId
  // and then use the custom hooks: useAuth, useTournamentStaticData, useTournamentRealtime.

  // If you had a specific TournamentContext provider, you would set it up here,
  // passing the necessary props (like tournamentId) to it.
  // However, TournamentRoomOrchestrator is designed to be self-contained with its hooks.

  return (
    <>
      <TournamentRoomOrchestrator />
      <Toaster />{" "}
      {/* Ensures toasts are available throughout the tournament experience */}
    </>
  );
};

export default TournamentPage;
