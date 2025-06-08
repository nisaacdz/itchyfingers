import { useState, useEffect, useCallback } from 'react';
import { httpService } from '@/api/httpService';
import { TournamentSchema, HttpResponse } from '@/types/api';

interface UseTournamentStaticDataReturn {
  tournament: TournamentSchema | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useTournamentStaticData = (tournamentId: string | undefined): UseTournamentStaticDataReturn => {
  const [tournament, setTournament] = useState<TournamentSchema | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!tournamentId) {
      setError("Tournament ID is not provided.");
      setIsLoading(false);
      setTournament(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await httpService.get<HttpResponse<TournamentSchema>>(
        `/tournaments/${tournamentId}`
      );

      console.log("Tournament static data response:", response);

      if (response.data.success && response.data.data) {
        setTournament(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch tournament details.');
        setTournament(null);
      }
    } catch (err: any) {
      console.error("Error fetching tournament static data:", err);
      const errorMessage = err.response?.data?.message || err.message || 'An unknown error occurred.';
      setError(errorMessage);
      setTournament(null);
    } finally {
      setIsLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    // Only fetch if tournamentId is present
    if (tournamentId) {
        fetchData();
    } else {
        setIsLoading(false); // If no tournamentId, not loading.
    }
  }, [fetchData, tournamentId]); // Add tournamentId to dependencies

  return { tournament, isLoading, error, refetch: fetchData };
};