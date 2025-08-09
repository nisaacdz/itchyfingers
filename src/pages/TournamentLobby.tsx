import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Input } from "@/components/ui/input";
import { Navbar } from "../components/Navbar";
import axiosInstance from "../api/httpService";
import {
  HttpResponse,
  Tournament,
  Pagination as PaginationType,
  TournamentPrivacy,
  TournamentStatus,
} from "../types/api";
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
import { TournamentCard } from "../components/tournament/TournamentCard";

function getTimeLeft(scheduledFor: string, status: TournamentStatus) {
  if (status === "started") return "Started";
  if (status === "ended") return "Ended";

  const now = new Date();
  const scheduledDate = new Date(scheduledFor);
  const diff = scheduledDate.getTime() - now.getTime();

  if (diff <= 0) return "Starting...";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export default function TournamentLobby() {
  const [tournaments, setTournaments] =
    useState<PaginationType<Tournament> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [privacyFilter, setPrivacyFilter] = useState<TournamentPrivacy | "all">("all");
  const [statusFilter, setStatusFilter] = useState<TournamentStatus | "all">("all");
  const navigate = useNavigate();

  const fetchTournaments = useCallback(
    async (
      pageNum = 1,
      currentSearchTerm = searchTerm,
      currentPrivacyFilter = privacyFilter,
      currentStatusFilter = statusFilter,
    ) => {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        params.append("page", pageNum.toString());
        params.append("limit", pageSize.toString());
        if (currentSearchTerm) {
          params.append("search", currentSearchTerm);
        }
        if (currentPrivacyFilter && currentPrivacyFilter != "all") {
          params.append("privacy", currentPrivacyFilter);
        }
        if (currentStatusFilter && currentStatusFilter != "all") {
          params.append("status", currentStatusFilter);
        }

        const response = await axiosInstance.get<
          HttpResponse<PaginationType<Tournament>>
        >(`/tournaments?${params.toString()}`);

        if (response.data.success) {
          setTournaments(response.data.data);
        } else {
          setError(response.data.message || "Failed to load tournaments");
        }
      } catch (err) {
        setError(
          (err instanceof Error && err.message) ||
          "An error occurred while fetching tournaments",
        );
      } finally {
        setLoading(false);
      }
    },
    [pageSize, searchTerm, privacyFilter, statusFilter],
  );

  useEffect(() => {
    fetchTournaments(page, searchTerm, privacyFilter, statusFilter);
  }, [
    page,
    pageSize,
    searchTerm,
    privacyFilter,
    statusFilter,
    fetchTournaments,
  ]);

  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((tick) => tick + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalPages = tournaments ? Math.ceil(tournaments.total / pageSize) : 0;

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(Number(newPageSize));
    setPage(1);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handlePrivacyChange = (value: TournamentPrivacy | "all") => {
    setPrivacyFilter(value);
    setPage(1);
  };

  const handleStatusChange = (value: TournamentStatus | "all") => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleJoinTournament = (tournamentId: string) => {
    navigate(`/tournaments/${tournamentId}`);
  };

  const handleSpectateTournament = (tournamentId: string) => {
    navigate(`/tournaments/${tournamentId}?spectator=true`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex-grow">
            <h1 className="text-4xl font-bold mb-2">Tournament Lobby</h1>
            <p className="text-lg text-muted-foreground">
              Find, join, or spectate typing competitions.
            </p>
          </div>
          <Button className="text-lg" onClick={() => setDialogOpen(true)}>
            Create Tournament
          </Button>
          <CreateTournamentDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onCreateSuccess={() => fetchTournaments(1)} // Refresh and go to page 1
          />
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <Input
            placeholder="Search tournaments..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="md:col-span-1"
          />
          <Select
            value={privacyFilter || undefined}
            onValueChange={handlePrivacyChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Privacy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="invitational">Invitational</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={statusFilter || undefined}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="started">Started</SelectItem>
              <SelectItem value="ended">Ended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(pageSize)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mt-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-5/6"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-10 bg-muted rounded mt-4"></div>
                    <div className="h-10 bg-muted rounded mt-2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !tournaments || tournaments.data.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Tournaments Found</CardTitle>
              <CardDescription>
                No tournaments match your current filters. Try adjusting them or
                check back later!
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tournaments.data.map((tournament) => {
              return (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  onJoinTournament={handleJoinTournament}
                  onSpectateTournament={handleSpectateTournament}
                />
              );
            })}
          </div>
        )}

        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              onClick={() =>
                fetchTournaments(page, searchTerm, privacyFilter, statusFilter)
              }
              variant="outline"
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh Tournaments"}
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Items per page:
              </span>
              <Select
                value={pageSize.toString()}
                onValueChange={handlePageSizeChange}
                disabled={loading}
              >
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
                    aria-disabled={page === 1 || loading}
                    className={
                      page === 1 || loading
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i + 1}>
                    <PaginationLink
                      isActive={page === i + 1}
                      onClick={() => !loading && setPage(i + 1)}
                      className={
                        loading ? "pointer-events-none opacity-50" : ""
                      }
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    aria-disabled={page === totalPages || loading}
                    className={
                      page === totalPages || loading
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
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
