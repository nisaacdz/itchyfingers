
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Navbar } from "../components/Navbar";
import { useAuthStore } from "../store/authStore";
import axiosInstance from "../api/axiosInstance";
import { ApiResponse, TournamentUpcomingSchema } from "../types/apiTypes";
import { format } from "date-fns";

export default function TournamentLobby() {
  const [tournaments, setTournaments] = useState<TournamentUpcomingSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.get<ApiResponse<TournamentUpcomingSchema[]>>('/tournaments');
      
      if (response.data.success && response.data.data) {
        setTournaments(response.data.data);
      } else {
        setError(response.data.message || "Failed to load tournaments");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load tournaments");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'default';
      case 'active':
        return 'destructive';
      case 'completed':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Tournament Lobby</h1>
          <p className="text-xl text-muted-foreground">
            Join live typing competitions and test your speed against other typists!
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : tournaments.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Tournaments Available</CardTitle>
              <CardDescription>
                There are currently no tournaments available. Check back later!
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tournaments.map((tournament) => (
              <Card key={tournament.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl">{tournament.name}</CardTitle>
                    <Badge variant={getStatusColor(tournament.status)}>
                      {tournament.status}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {tournament.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Participants:</span>
                      <span>{tournament.current_participants}/{tournament.max_participants}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="capitalize">{tournament.status}</span>
                    </div>

                    {tournament.scheduled_start && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Starts:</span>
                        <span>{format(new Date(tournament.scheduled_start), 'MMM dd, HH:mm')}</span>
                      </div>
                    )}

                    <div className="pt-4">
                      <Link to={`/tournament/${tournament.id}`}>
                        <Button 
                          className="w-full" 
                          disabled={tournament.status === 'completed' || tournament.current_participants >= tournament.max_participants}
                        >
                          {tournament.status === 'completed' 
                            ? 'Tournament Ended' 
                            : tournament.current_participants >= tournament.max_participants
                            ? 'Tournament Full'
                            : tournament.status === 'active'
                            ? 'Join Now'
                            : 'Join Tournament'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Button onClick={fetchTournaments} variant="outline">
            Refresh Tournaments
          </Button>
        </div>
      </div>
    </div>
  );
}
