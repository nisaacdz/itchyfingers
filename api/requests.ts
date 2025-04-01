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
  UserProfile,
  ClientSchema,
} from "@/types/request";

export { typingSocketAPI } from "./socket";

export async function getTypingText(tournamentId: string) {
  const req = await Api.get<string>(`tournaments/${tournamentId}/text`);
  return req.result || "";
}

export async function fetchTournaments(
  page: number,
  limit: number,
  filter?: TournamentFilter,
) {
  return await Api.get<PaginatedData<TournamentInfo>>(`/tournaments`, {
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
  const response = await Api.get<ClientSchema>("/auth/me");
  return response.result;
}

export async function getUserProfile(username: string) {
  return await Api.get<UserProfile>(`/users/${username}/`);
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

export async function loginUser(logins: {
  username: string;
  password: string;
}) {
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
