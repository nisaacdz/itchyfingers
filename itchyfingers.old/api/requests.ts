import Api from ".";
import { CreateTournament } from "@/types/forms";
import {
  TournamentInfo,
  TournamentFilter,
  PaginatedData,
  Participant,
  User,
  UserTournament,
  UserTournamentFilter,
  Client,
  Tournament,
} from "@/types/request";

export { typingSocketAPI } from "./socket";

export async function getTypingText(tournamentId: string) {
  const req = await Api.get<string>(`tournaments/${tournamentId}/text`);
  return req.result || "";
}

export async function allTournaments(
  page: number,
  limit: number,
  filter?: TournamentFilter,
) {
  return await Api.get<PaginatedData<Tournament>>(`/tournaments`, {
    params: {
      page,
      limit,
      filter: filter || undefined,
    },
  });
}

export async function fetchUserSession(tournamentId: string, userId: string) {
  return await Api.get<Participant>(
    `/tournaments/${tournamentId}/participants/${userId}`,
  );
}

export async function fetchTournament(tournamentId: string) {
  return (await Api.get<TournamentInfo>(`/tournaments/${tournamentId}`)).result;
}

export async function enterTournament(tournamentId: string) {
  return (
    await Api.patch<TournamentInfo>(`/tournaments/${tournamentId}/enter`, {})
  ).result;
}

export async function getCurrentUser() {
  const response = await Api.get<Client>("/auth/me");
  return response.result;
}

export async function getUser(username: string) {
  return await Api.get<User>(`/users/${username}`);
}

export async function getUserTournaments(
  userId: number,
  page: number,
  pageSize: number,
  filter?: UserTournamentFilter,
) {
  return await Api.get<PaginatedData<UserTournament>>(
    `/users/${userId}/challenges`,
    {
      params: {
        page,
        pageSize,
        filter: filter || undefined,
      },
    },
  );
}

export async function loginUser(logins: { email: string; password: string }) {
  return await Api.post<User>("/auth/login", logins);
}

export async function registerUser(logins: {
  email: string;
  password: string;
}) {
  return await Api.post<User>("/auth/register", logins);
}

export async function updateUsername(userId: number, username: string) {
  return await Api.patch<User>(`/users/${userId}/update`, { username });
}

export async function logoutUser() {
  return await Api.patch<string>("/auth/logout", {});
}

export async function fetchSessionParticipants(tournamentId: string) {
  return await Api.get<Participant[]>(
    `/tournaments/${tournamentId}/participants`,
  );
}

export async function createTournament(
  challenge: CreateTournament,
  invitedUsers: string[] = [],
) {
  return await Api.post<TournamentInfo>(`/tournaments`, {
    ...challenge,
    invitedUsers,
  });
}

export async function fetchUserTournaments(
  userId: string,
  page: number,
  pageSize: number,
  filter?: UserTournamentFilter,
) {
  return await Api.get<PaginatedData<UserTournament>>(
    `/users/${userId}/challenges`,
    {
      params: {
        page,
        pageSize,
        filter: filter || undefined,
      },
    },
  );
}
