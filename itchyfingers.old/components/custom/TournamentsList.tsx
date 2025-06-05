"use client";

import React, { KeyboardEventHandler, useRef } from "react";
import {
  Globe,
  User,
  Hourglass,
  Users,
  Unlock,
  SearchIcon,
  PlusIcon,
} from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { TournamentPrivacy, TournamentPrivacyFilter } from "@/types/request";
import { enterTournament, allTournaments } from "@/api/requests";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  useQueryState,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  PaginationLink,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { parseTournamentPrivacyFilter } from "@/util";

const formatTimeRemaining = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);

  if (diffInSeconds < 0) return "Started";
  if (diffInSeconds < 60) return `${diffInSeconds}s`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  return `${Math.floor(diffInSeconds / 86400)}d`;
};

const TournamentsList = ({
  createChallenge,
}: {
  createChallenge: () => void;
}) => {
  const [page, setPage] = useQueryState<number>(
    "page",
    parseAsInteger.withDefault(1),
  );
  const [pageSize, setPageSize] = useQueryState<number>(
    "pageSize",
    parseAsInteger.withDefault(15),
  );

  const [privacyFilter, setPrivacyFilter] = useQueryState(
    "privacy",
    parseAsStringEnum<TournamentPrivacyFilter>(
      Object.values(TournamentPrivacyFilter),
    ).withDefault(TournamentPrivacyFilter.All),
  );

  const [search, setSearch] = useQueryState<string>(
    "search",
    parseAsString.withDefault(""),
  );

  const router = useRouter();

  const {
    data: response,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["tournaments", page, pageSize],
    queryFn: () =>
      allTournaments(page, pageSize, {
        search,
        privacy: parseTournamentPrivacyFilter(privacyFilter),
      }),
    retry: false,
  });

  if (!isLoading && (!response || response.error)) {
    console.log(response?.error);
    return (
      <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive-foreground max-w-4xl mx-auto">
        <p>Error: {response?.error || "Failed to load challenges"}</p>
        <Button variant="outline" className="mt-2" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const result = response?.result;

  const totalPages =
    !result?.total || !result?.limit
      ? undefined
      : Math.ceil(result.total / result.limit);

  const handlePrevious = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => {
    setPage((p) => Math.min(totalPages || p, p + 1));
  };

  const enterCompetion = (tournamentId: string) => {
    enterTournament(tournamentId)
      .then(() => {
        router.push(`/tournaments/${tournamentId}`);
      })
      .catch((e) => toast.error(e.message));
  };

  return (
    <div className="p-4 space-y-6 mx-auto">
      <ControlsSection
        onSearch={setSearch}
        privacyFilter={privacyFilter}
        onChangeTournamentPrivacy={setPrivacyFilter}
        createChallenge={createChallenge}
      />
      <div className="">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Creator</TableHead>
              <TableHead>Starts In</TableHead>
              <TableHead>Participants</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-5 w-5 rounded-full mx-auto" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-8 mx-auto" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : response?.result?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No challenges available
                </TableCell>
              </TableRow>
            ) : (
              response?.result?.data?.map((tournament) => (
                <TableRow key={tournament.id} className="hover:bg-muted/50">
                  <TableCell>
                    <span
                      title={
                        tournament.privacy === TournamentPrivacy.Open
                          ? "Open Challenge"
                          : "You're Invited"
                      }
                    >
                      {tournament.privacy === TournamentPrivacy.Open ? (
                        <Globe size={20} className="text-primary mx-auto" />
                      ) : (
                        <Unlock
                          size={20}
                          className="text-destructive mx-auto"
                        />
                      )}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div
                      className="flex items-center gap-2"
                      title={`Creator: ${tournament.created_by.username}`}
                    >
                      <User size={16} className="text-muted-foreground" />
                      <span>{tournament.created_by.username}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div
                      className="flex items-center gap-2"
                      title={`Starts in ${formatTimeRemaining(
                        new Date(tournament.scheduled_for),
                      )}`}
                    >
                      <Hourglass size={16} className="text-muted-foreground" />
                      <span>
                        {formatTimeRemaining(
                          new Date(tournament.scheduled_for),
                        )}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div
                      className="flex items-center gap-2"
                      title={`${tournament.joined} participants`}
                    >
                      <Users size={16} className="text-muted-foreground" />
                      <span>{tournament.joined}</span>
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => enterCompetion(tournament.id)}
                    >
                      Enter
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && response?.result && (totalPages || 1) > 1 && (
        <PaginationSection
          page={response.result.page}
          pageSize={response.result.limit}
          totalPages={totalPages || 1}
          setPage={setPage}
          setPageSize={setPageSize}
          handlePrevious={handlePrevious}
          handleNext={handleNext}
        />
      )}
    </div>
  );
};

type ControlsSectionProps = {
  onSearch: (value: string) => void;
  privacyFilter: TournamentPrivacyFilter;
  onChangeTournamentPrivacy: (value: TournamentPrivacyFilter) => void;
  createChallenge: () => void;
};

const ControlsSection = ({
  onSearch,
  privacyFilter,
  onChangeTournamentPrivacy,
  createChallenge,
}: ControlsSectionProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearchSubmit = () => {
    onSearch(inputRef.current?.value || "");
  };

  const handleSubmitByEnterDown: KeyboardEventHandler<HTMLInputElement> = (
    e,
  ) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const handleFilterChange = (value: string) => {
    if (
      value === TournamentPrivacyFilter.All ||
      value === TournamentPrivacyFilter.Open ||
      value === TournamentPrivacyFilter.Invitational
    ) {
      onChangeTournamentPrivacy(value as TournamentPrivacyFilter);
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          placeholder="Enter keywords..."
          className="max-w-[400px] lg:max-w-lg lg:w-[420px]"
          onKeyDown={handleSubmitByEnterDown}
        />
        <Button onClick={handleSearchSubmit}>
          <SearchIcon className="size-6" />
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <Select value={privacyFilter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="Invitational">Invitational</SelectItem>
          </SelectContent>
        </Select>

        <Button className="flex items-center gap-2" onClick={createChallenge}>
          <PlusIcon className="w-6 h-6" />
          Create Challenge
        </Button>
      </div>
    </div>
  );
};

type PaginationSectionProps = {
  page: number;
  pageSize: number;
  totalPages: number;
  setPage: (value: number) => void;
  setPageSize: (value: number) => void;
  handlePrevious: () => void;
  handleNext: () => void;
};

const PaginationSection = ({
  page,
  pageSize,
  totalPages,
  setPage,
  setPageSize,
  handlePrevious,
  handleNext,
}: PaginationSectionProps) => {
  const displayingPageNumbers = [];
  if (page - 2 >= 1) displayingPageNumbers.push(page - 2);
  if (page - 1 >= 1) displayingPageNumbers.push(page - 1);
  displayingPageNumbers.push(page);
  if (page + 1 <= totalPages) displayingPageNumbers.push(page + 1);
  if (page + 2 <= totalPages) displayingPageNumbers.push(page + 2);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => setPageSize(Number(value))}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder={pageSize} />
          </SelectTrigger>
          <SelectContent>
            {[10, 15, 20, 50].map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">per page</span>
      </div>

      <div className="">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={handlePrevious}
                isActive={page !== 1}
              />
            </PaginationItem>
            {displayingPageNumbers[0] > 1 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            {displayingPageNumbers.map((pageNumber) => (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  isActive={page === pageNumber}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            ))}
            {displayingPageNumbers[displayingPageNumbers.length - 1] <
              totalPages && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationNext
                onClick={handleNext}
                isActive={page !== totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default TournamentsList;
