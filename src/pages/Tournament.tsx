import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Navbar } from "../components/Navbar";
import {
  useTournamentStore,
  selectMyParticipantData,
  selectAllParticipantsArray, 
  selectOtherParticipantsArray
} from "../store/tournamentStore";
import { useAuthStore } from "../store/authStore";
import axiosInstance from "../api/apiService";
import socketService from "../api/socketService"; 
import {
  HttpResponse,
  TournamentSchema,
  TournamentSession,
  TournamentUpdateSchema,
  TypingSessionSchema,
  ClientSchema, // Updated to use the corrected ClientSchema
  ApiResponse,
} from "../types/api";
import { TypingInterface } from "../components/TypingInterface"; 
import { useToast } from "@/hooks/use-toast"; 

export default function Tournament() {
  const { id: tournamentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    currentTournament,
    liveTournamentSession,
    // participants, // This is a Record; use selectors for arrays
    setCurrentTournament,
    setLiveTournamentSession,
    setParticipants, 
    updateParticipant,
    removeParticipant,
    setLoading,
    loading,
    resetCurrentTournament,
  } = useTournamentStore();

  const { client: authClient } = useAuthStore(); 
  const [error, setError] = useState<string | null>(null);

  const myParticipantData = useTournamentStore((state) =>
    selectMyParticipantData(state, authClient?.id)
  );
  const otherParticipantsArray = useTournamentStore((state) => 
    selectOtherParticipantsArray(state, authClient?.id)
  );
  const allParticipantsArray = useTournamentStore(selectAllParticipantsArray);

  const fetchTournament = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        const response = await axiosInstance.get<HttpResponse<TournamentSchema>>(
          `/tournaments/${id}`,
        );
        if (response.data.success && response.data.data) {
          setCurrentTournament(response.data.data);
          setError(null); 
        } else {
          setError(response.data.message || "Failed to load tournament");
          toast({
            title: "Error",
            description: response.data.message || "Failed to load tournament",
            variant: "destructive",
          });
        }
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          "An unexpected error occurred while fetching tournament details.";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setCurrentTournament, toast],
  );

  useEffect(() => {
    if (tournamentId) {
      fetchTournament(tournamentId);
      socketService
        .connect(tournamentId)
        .then(() => {
          console.log("Socket connected for tournament:", tournamentId);
          toast({ title: "Connected", description: "Joined tournament room." });
        })
        .catch((err) => {
          console.error("Socket connection error:", err);
          setError("Failed to connect to tournament room.");
          toast({
            title: "Connection Error",
            description: "Could not connect to the tournament room.",
            variant: "destructive",
          });
        });
    } else {
      navigate("/tournaments"); 
    }

    socketService.onJoinResponse((data: ApiResponse<null>) => {
      if (data.success) {
        toast({ title: "Joined", description: data.message });
      } else {
        toast({
          title: "Join Error",
          description: data.message,
          variant: "destructive",
        });
        setError(data.message);
      }
    });

    socketService.onTournamentStart((data: TournamentSession) => {
      console.log("Tournament started:", data);
      setLiveTournamentSession(data);
      const updated_tournament: TournamentSchema = { ...currentTournament, text: data.text || currentTournament.text, status: "active" };
      setCurrentTournament(updated_tournament);
      toast({ title: "Tournament Started!", description: "The race is on!" });
    });

    socketService.onTournamentUpdate((data: TournamentUpdateSchema) => {
      console.log("Tournament update:", data);
      setLiveTournamentSession(data.tournament);
      setParticipants(data.participants); // setParticipants expects an array
      if (currentTournament && data.tournament.id === currentTournament.id) {
        const updated_tournament: TournamentSchema = { ...currentTournament, text: data.tournament.text || currentTournament.text, status: data.tournament.ended_at ? "completed" : data.tournament.started_at ? "active" : "waiting" };
        setCurrentTournament(updated_tournament);
      }
    });

    socketService.onTypingUpdate((response: ApiResponse<TypingSessionSchema>) => {
      if (response.success && response.data) {
        updateParticipant(response.data);
      } else {
        console.warn("Typing update issue:", response.message);
      }
    });

    socketService.onUserLeft((data: ClientSchema) => { // Corrected to ClientSchema
      console.log("User left:", data);
      removeParticipant(data.id);
      toast({ description: `${data.user?.username || "A participant"} left.` });
    });

    socketService.onLeaveResponse((data: ApiResponse<null>) => {
      if (data.success) {
        toast({ title: "Left Tournament", description: data.message });
      } else {
        toast({
          title: "Error Leaving",
          description: data.message,
          variant: "destructive",
        });
      }
    });

    socketService.onTypingError((data: ApiResponse<null>) => {
      toast({
        title: "Typing Error",
        description: data.message,
        variant: "destructive",
      });
    });
    
    socketService.onTournamentEnd(() => {
        toast({ title: "Tournament Ended", description: "The tournament has concluded." });
        
        const updatedSession: TournamentSession | null = liveTournamentSession ? { ...liveTournamentSession, ended_at: new Date().toISOString() } : null;
        setLiveTournamentSession(updatedSession);
        
        const updatedTournament: TournamentSchema | null = currentTournament ? { ...currentTournament, status: "completed" } : null;
        setCurrentTournament(updatedTournament);
    });

    return () => {
      socketService.emitLeaveTournament(); 
      socketService.disconnect();
      resetCurrentTournament(); 
      console.log("Socket disconnected and listeners removed for tournament:", tournamentId);
    };
  }, [
    tournamentId,
    fetchTournament,
    // setLoading, // setLoading is part of fetchTournament closure
    setCurrentTournament,
    setLiveTournamentSession,
    setParticipants,
    updateParticipant,
    removeParticipant,
    resetCurrentTournament,
    navigate,
    toast,
    currentTournament, // currentTournament is a dependency for onTournamentUpdate logic
  ]);

  if (loading && !currentTournament) { 
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading tournament...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-500">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  console.log(currentTournament, "Current Tournament Data");

  if (!currentTournament) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Tournament Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p>The tournament you're looking for doesn't exist.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{currentTournament.name}</h1>
          <p className="text-muted-foreground mb-4">
            {currentTournament.description}
          </p>

          <div className="flex gap-4 mb-4">
            <Badge
              variant={
                liveTournamentSession?.started_at && !liveTournamentSession?.ended_at
                  ? "default" 
                  : currentTournament.status === "active" ? "default" 
                  : "secondary"
              }
            >
              {liveTournamentSession?.started_at && !liveTournamentSession?.ended_at
                ? "Active"
                : liveTournamentSession?.ended_at
                ? "Completed"
                : "Room"}
            </Badge>
            <Badge variant="outline">
              Max Players: {currentTournament.max_participants}
            </Badge>
            {liveTournamentSession?.scheduled_for && (
              <Badge variant="outline">
                Starts: {new Date(liveTournamentSession.scheduled_for).toLocaleString()}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Text to Type</CardTitle>
              <CardDescription>
                {liveTournamentSession?.started_at && !liveTournamentSession?.ended_at
                  ? "The race is on!"
                  : liveTournamentSession?.ended_at
                  ? "Race has ended."
                  : "Waiting for the tournament to start..."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TypingInterface />
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Participants ({allParticipantsArray.length})</CardTitle> 
              <CardDescription>Live participant progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allParticipantsArray.length === 0 ? (
                  <p className="text-muted-foreground">No participants yet. Waiting for players to join...</p>
                ) : (
                  allParticipantsArray.map((participant) => (
                    <div
                      key={participant.client.id}
                      className="space-y-2 p-2 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <span
                          className={`font-medium ${participant.client.id === authClient?.id ? 'text-primary' : ''}`}>
                          {participant.client.user
                            ? participant.client.user.username
                            : `Anonymous (${participant.client.id.substring(0,6)})`}
                          {participant.client.id === authClient?.id && " (You)"}
                        </span>
                        <div className="flex gap-2 text-sm text-muted-foreground">
                          <span>{participant.current_speed.toFixed(0)} WPM</span>
                          <span>{participant.current_accuracy.toFixed(1)}%</span>
                        </div>
                      </div>
                      <Progress
                        value={
                          (participant.correct_position / 
                            (liveTournamentSession?.text?.length || currentTournament.text?.length || 1)) *
                          100
                        }
                        className="h-2"
                        indicatorClassName={participant.client.id === authClient?.id ? "bg-primary" : "bg-secondary"}
                      />
                       {participant.current_position !== participant.correct_position && (
                         <Progress
                            value={
                            (participant.current_position /
                                (liveTournamentSession?.text?.length || currentTournament.text?.length || 1)) *
                            100
                            }
                            className="h-1 mt-1 opacity-50"
                            /* indicatorClassName="bg-destructive" */
                         />
                       )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
