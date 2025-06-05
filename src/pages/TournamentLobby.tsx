import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Navbar } from "../components/Navbar";
import { useAuthStore } from "../store/authStore";
import axiosInstance from "../api/apiService";
import { HttpResponse, TournamentUpcomingSchema, PaginatedData } from "../types/api";
import { format } from "date-fns";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateTournamentDialog } from "./CreateTournament";

export default function TournamentLobby() {
  const [tournaments, setTournaments] = useState<PaginatedData<TournamentUpcomingSchema> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuthStore();

  const fetchTournaments = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get<
        HttpResponse<PaginatedData<TournamentUpcomingSchema>>
      >(`/tournaments?page=${pageNum}&limit=${pageSize}`);

      console.log("Tournaments is ", response.data.data)
      
      if (response.data.success) {
        setTournaments(response.data.data);
      } else {
        setError("Failed to load tournaments");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load tournaments");
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchTournaments(page);
  }, [page, fetchTournaments]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "default";
      case "active":
        return "destructive";
      case "completed":
        return "secondary";
      default:
        return "outline";
    }
  };

  // Helper function to determine tournament status based on scheduled_for
  const getTournamentStatus = (scheduledFor: string): "waiting" | "active" | "completed" => {
    const now = new Date();
    const scheduledDate = new Date(scheduledFor);
    
    if (scheduledDate > now) {
      return "waiting";
    } else {
      // For simplicity, assume tournaments are active if scheduled time has passed
      // You might want to add more logic here based on your backend implementation
      return "active";
    }
  };

  const totalPages = tournaments ? Math.ceil(tournaments.total / pageSize) : 0;

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(Number(newPageSize));
    setPage(1); // Reset to first page when page size changes
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-4">Tournament Lobby</h1>
            <p className="text-xl text-muted-foreground">
              Join live typing competitions and test your speed against other
              typists!
            </p>
          </div>
          <>
            <Button className="text-lg" onClick={() => setDialogOpen(true)}>
              Create Tournament
            </Button>
            <CreateTournamentDialog open={dialogOpen} onOpenChange={setDialogOpen} />
          </>
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
        ) : !tournaments || tournaments.data.length === 0 ? (
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
            {tournaments.data.map((tournament) => {
              const status = getTournamentStatus(tournament.scheduled_for);
              return (
                <Card
                  key={tournament.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-xl">{tournament.title}</CardTitle>
                      <Badge variant={getStatusColor(status)}>
                        {status}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      Created by {tournament.created_by.username}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Participants:
                        </span>
                        <span>{tournament.joined}</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="capitalize">{status}</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Privacy:</span>
                        <span className="capitalize">{tournament.privacy}</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Scheduled:</span>
                        <span>
                          {format(
                            new Date(tournament.scheduled_for),
                            "MMM dd, HH:mm",
                          )}
                        </span>
                      </div>

                      <div className="pt-4">
                        <Link to={`/tournament/${tournament.id}`}>
                          <Button
                            className="w-full"
                            disabled={status === "completed"}
                          >
                            {status === "completed"
                              ? "Tournament Ended"
                              : status === "active"
                                ? "Join Now"
                                : "Join Tournament"}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
            <Button onClick={() => fetchTournaments(page)} variant="outline">
              Refresh Tournaments
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Items per page:</span>
              <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="9">9</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="18">18</SelectItem>
                  <SelectItem value="24">24</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-disabled={page === 1}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i + 1}>
                    <PaginationLink
                      isActive={page === i + 1}
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    aria-disabled={page === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </div>
  );
}
