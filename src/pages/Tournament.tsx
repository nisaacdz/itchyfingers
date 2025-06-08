// src/pages/TournamentPage.tsx (or keep as Tournament.tsx)
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar"; // Adjust path
import TournamentHeader from "@/components/TournamentHeader"; // Adjust path
import TypingChallengeArea from "@/components/TypingChallengeArea"; // Adjust path
import ParticipantsPanel from "@/components/ParticipantsPanel"; // Adjust path
import TournamentStatusDisplay from "@/components/TournamentStatusDisplay"; // Adjust path

import {
  useTournamentStore
  // Selectors are used within child components or not needed at this top level anymore
} from "../store/tournamentStore"; // Adjust path
// import { useAuthStore } from "../store/authStore"; // authClient used in ParticipantsPanel
import axiosInstance from "../api/apiService"; // Adjust path
import socketService from "../api/socketService"; // Adjust path
import {
  HttpResponse,
  TournamentSchema,
  TournamentSession,
  TournamentUpdateSchema,
  TypingSessionSchema,
  ClientSchema,
  ApiResponse,
} from "../types/api"; // Adjust path
import { useToast } from "@/hooks/use-toast"; // Adjust path

export default function TournamentPage() {
  const { id: tournamentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    currentTournament,
    liveTournamentSession,
    setCurrentTournament,
    setLiveTournamentSession,
    setParticipants,
    updateParticipant,
    removeParticipant,
    setLoading: setStoreLoading, // Renamed to avoid conflict with local loading if any
    loading: storeLoading,       // Renamed
    resetCurrentTournament,
  } = useTournamentStore();

  // const { client: authClient } = useAuthStore(); // Moved to ParticipantsPanel
  const [pageError, setPageError] = useState<string | null>(null); // For fetch/socket connection errors

  const fetchTournament = useCallback(
    async (id: string) => {
      try {
        setStoreLoading(true);
        setPageError(null);
        const response = await axiosInstance.get<HttpResponse<TournamentSchema>>(
          `/tournaments/${id}`
        );
        if (response.data.success && response.data.data) {
          setCurrentTournament(response.data.data);
        } else {
          const msg = response.data.message || "Failed to load tournament";
          setPageError(msg);
          toast({ title: "Error", description: msg, variant: "destructive" });
        }
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          "An unexpected error occurred while fetching tournament details.";
        setPageError(errorMessage);
        toast({ title: "Error", description: errorMessage, variant: "destructive" });
      } finally {
        setStoreLoading(false);
      }
    },
    [setStoreLoading, setCurrentTournament, toast]
  );

  // Initial fetch and socket connection management
  useEffect(() => {
    if (tournamentId) {
      fetchTournament(tournamentId); // fetchTournament is stable
      socketService
        .connect(tournamentId)
        .then(() => {
          console.log("Socket connected for tournament:", tournamentId);
          toast({ title: "Connected", description: "Joined tournament room." });
        })
        .catch((err) => {
          console.error("Socket connection error:", err);
          const msg = "Failed to connect to tournament room.";
          setPageError(msg); // Use pageError for this critical failure
          toast({ title: "Connection Error", description: msg, variant: "destructive" });
        });
    } else {
      navigate("/tournaments"); // Should ideally not happen if route is protected
    }

    return () => {
      socketService.emitLeaveTournament();
      socketService.disconnect();
      resetCurrentTournament();
      console.log("Socket disconnected and state reset for tournament:", tournamentId);
    };
  }, [tournamentId, fetchTournament, navigate, resetCurrentTournament, toast]); // All stable

  // Socket event listeners
  useEffect(() => {
    // Define handlers locally or import if they become very large
    const handleJoinResponse = (data: ApiResponse<null>) => {
      if (data.success) {
        toast({ title: "Joined", description: data.message });
      } else {
        toast({ title: "Join Error", description: data.message, variant: "destructive" });
        // setPageError(data.message); // Or a less critical local error for non-fatal join issues
      }
    };

    const handleTournamentStart = (data: TournamentSession) => {
      console.log("Tournament started:", data);
      setLiveTournamentSession(data);
      setCurrentTournament(prev => {
        if (prev) return { ...prev, text: data.text ?? prev.text, status: "active" };
        // If prev is null, it implies fetchTournament hasn't completed or failed.
        // We might not want to create a partial currentTournament from just session data.
        // The UI should ideally rely on liveTournamentSession for active game.
        return null;
      });
      toast({ title: "Tournament Started!", description: "The race is on!" });
    };

    const handleTournamentUpdate = (data: TournamentUpdateSchema) => {
      console.log("Tournament update:", data);
      setLiveTournamentSession(data.tournament);
      setParticipants(data.participants);
      setCurrentTournament(prev => {
        if (prev && data.tournament.id === prev.id) {
          return {
            ...prev,
            text: data.tournament.text ?? prev.text,
            status: data.tournament.ended_at
              ? "completed"
              : data.tournament.started_at
              ? "active"
              : prev.status,
          };
        }
        return prev;
      });
    };

    const handleTypingUpdate = (response: ApiResponse<TypingSessionSchema>) => {
      if (response.success && response.data) {
        updateParticipant(response.data);
      } else {
        console.warn("Typing update issue:", response.message);
      }
    };

    const handleUserLeft = (data: ClientSchema) => {
      console.log("User left:", data);
      removeParticipant(data.id);
      toast({ description: `${data.user?.username || "A participant"} left.` });
    };
    
    const handleTournamentEnd = () => {
        toast({ title: "Tournament Ended", description: "The tournament has concluded." });
        setLiveTournamentSession(prevSession => 
            prevSession ? { ...prevSession, ended_at: new Date().toISOString() } : null
        );
        setCurrentTournament(prevCurrentTournament => 
            prevCurrentTournament ? { ...prevCurrentTournament, status: "completed" } : null
        );
    };

    // ... (other handlers: onLeaveResponse, onTypingError)
    socketService.onJoinResponse(handleJoinResponse);
    socketService.onTournamentStart(handleTournamentStart);
    socketService.onTournamentUpdate(handleTournamentUpdate);
    socketService.onTypingUpdate(handleTypingUpdate);
    socketService.onUserLeft(handleUserLeft);
    socketService.onTournamentEnd(handleTournamentEnd);
    // socketService.onLeaveResponse(...);
    // socketService.onTypingError(...);

    // Cleanup is implicitly handled by socketService.disconnect() in the first useEffect.
    // If more granular cleanup is needed (e.g., socketService.off('event', handler)), do it here.
    return () => {
        // Example of explicit cleanup if socketService.disconnect() isn't enough or for specific listeners
        // socketService.off('join:response', handleJoinResponse); 
        // ...
    }

  }, [setCurrentTournament, setLiveTournamentSession, setParticipants, updateParticipant, removeParticipant, toast]); // All stable store setters

  // Conditional Rendering Logic
  if (storeLoading && !currentTournament && !pageError) {
    return <TournamentStatusDisplay loading />;
  }

  if (pageError) {
    return <TournamentStatusDisplay error={pageError} />;
  }

  if (!currentTournament) {
    // This case can occur if fetch completes but returns no data, or if tournamentId was bad from start
    return <TournamentStatusDisplay notFound message="Tournament data could not be loaded or the tournament does not exist." />;
  }

  // Main content rendering
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <TournamentHeader
          tournament={currentTournament}
          liveSession={liveTournamentSession}
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <TypingChallengeArea
            liveSession={liveTournamentSession}
            // currentTournament={currentTournament} // If needed for fallback text
          />
          {/* <ParticipantsPanel
            liveTournamentSession={liveTournamentSession}
            currentTournament={currentTournament}
          /> */}
        </div>
      </div>
    </div>
  );
}