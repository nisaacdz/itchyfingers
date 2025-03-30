import Api from ".";
import { CreateChallenge } from "../types/forms";
import {
  Challenge,
  ChallengeFilter,
  PaginatedData,
  Participant,
  User,
  UserChallenge,
  UserChallengeFilter,
  UserProfile,
} from "@/types/request";

export { typingSocketAPI } from "./socket";

export async function getTypingText(tournamentId: string) {
  const req = await Api.get<string>(`tournaments/${tournamentId}/text`);
  return req.result || "";
}

export async function fetchTournaments(
  page: number,
  limit: number,
  filter?: ChallengeFilter,
) {
  return await Api.get<PaginatedData<Challenge>>(`/tournaments`, {
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

export async function fetchChallenge(tournamentId: string) {
  return (await Api.get<Challenge>(`/tournaments/${tournamentId}`)).result;
}

export async function enterTournament(tournamentId: string) {
  return (await Api.patch<Challenge>(`/tournaments/${tournamentId}/enter`, {}))
    .result;
}

export async function getCurrentUser() {
  const user = await Api.get<User>("/auth/me");
  return user.result;
}

export async function getUserProfile(username: string) {
  return await Api.get<UserProfile>(`/users/${username}/`);
}

export async function getUserChallenges(
  userId: string,
  page: number,
  pageSize: number,
  filter?: UserChallengeFilter,
) {
  return await Api.get<PaginatedData<UserChallenge>>(
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

export async function updateUsername(user: User, username: string) {
  return await Api.patch<User>(`/users/${user.username}`, { username });
}

export async function logoutUser() {
  return await Api.patch<string>("/auth/logout", {});
}

export async function fetchSessionParticipants(tournamentId: string) {
  return await Api.get<Participant[]>(
    `/tournaments/${tournamentId}/participants`,
  );
}

export async function createChallenge(
  challenge: CreateChallenge,
  invitedUsers: string[] = [],
) {
  return await Api.post<Challenge>(`/tournaments`, {
    ...challenge,
    invitedUsers,
  });
}

export async function fetchUserChallenges(
  userId: string,
  page: number,
  pageSize: number,
  filter?: UserChallengeFilter,
) {
  return await Api.get<PaginatedData<UserChallenge>>(
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
