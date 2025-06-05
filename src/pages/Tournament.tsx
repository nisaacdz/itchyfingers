import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
import { useTournamentStore } from "../store/tournamentStore";
import { useAuthStore } from "../store/authStore";
import axiosInstance from "../api/apiService";
import { HttpResponse, TournamentSchema } from "../types/api";

export default function Tournament() {
  const { id } = useParams<{ id: string }>();
  const {
    currentTournament,
    participants,
    setCurrentTournament,
    setLoading,
    loading,
  } = useTournamentStore();
  const { user } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchTournament(id);
    }
  }, [id]);

  const fetchTournament = async (tournamentId: string) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get<HttpResponse<TournamentSchema>>(
        `/tournaments/${tournamentId}`,
      );

      if (response.data.success && response.data.data) {
        setCurrentTournament(response.data.data);
      } else {
        setError(response.data.message || "Failed to load tournament");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load tournament");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
                currentTournament.status === "active" ? "default" : "secondary"
              }
            >
              {currentTournament.status}
            </Badge>
            <Badge variant="outline">
              Max Players: {currentTournament.max_participants}
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Tournament Text */}
          <Card>
            <CardHeader>
              <CardTitle>Text to Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-lg leading-relaxed">
                  {currentTournament.text || "Loading tournament text..."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Participants */}
          <Card>
            <CardHeader>
              <CardTitle>Participants ({participants.length})</CardTitle>
              <CardDescription>Live participant progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {participants.length === 0 ? (
                  <p className="text-muted-foreground">No participants yet</p>
                ) : (
                  participants.map((participant) => (
                    <div key={participant.client.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">
                          {participant.client.user
                            ? participant.client.user.username
                            : "Anonymous"}
                        </span>
                        <div className="flex gap-2 text-sm text-muted-foreground">
                          <span>{participant.current_speed} WPM</span>
                          <span>{participant.current_accuracy}% acc</span>
                        </div>
                      </div>
                      <Progress
                        value={
                          (participant.current_position /
                            (currentTournament.text?.length || 1)) *
                          100
                        }
                        className="h-2"
                      />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Typing Interface (placeholder for now) */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Typing Interface</CardTitle>
            <CardDescription>
              Start typing when the tournament begins
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center">
              <p className="text-muted-foreground">
                Typing interface will be implemented here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
