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
} from "../types/request";
import { Axios } from "../util/axios";

export { typingSocketAPI } from "./socket";

export async function getTypingText(tournamentId: string) {
  try {
    const req = await Axios.get(`tournaments/${tournamentId}/text`);

    if (req.status !== 200) {
      throw new Error(req.data || "Something went wrong");
    }

    return (req.data.text || "") as string;
  } catch (e) {
    throw e as Error;
  }
}

export async function fetchTournaments(
  page: number,
  pageSize: number,
  filter?: ChallengeFilter,
) {
  return await Api.get<PaginatedData<Challenge>>(`/tournaments`, {
    params: {
      page,
      pageSize,
      filter: filter || undefined,
    },
  });
}

export async function fetchUserSession(tournamentId: string, userId: string) {
  try {
    const req = await Axios.get(`/typingsessions/${tournamentId}/${userId}`);

    if (req.status !== 200) {
      throw new Error(req.data || "Something went wrong");
    }

    return req.data as Participant | null;
  } catch (e) {
    throw e as Error;
  }
}

export async function fetchChallenge(tournamentId: string) {
  return (await Api.get<Challenge>(`/tournaments/${tournamentId}`)).result;
}

export async function enterTournament(tournamentId: string) {
  return (await Api.patch<Challenge>(`/tournaments/${tournamentId}/enter`, {}))
    .result;
}

export async function getCurrentUser() {
  // const user = await Api.get<User>("/auth/current");
  // return user.result;
  return null;
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
  try {
    const req = await Axios.get(`/challenges/${tournamentId}/participants`);

    if (req.status !== 200) {
      throw new Error(req.data || "Something went wrong");
    }
    return req.data as Participant[];
  } catch (e) {
    throw e as Error;
  }
}

export async function createChallenge(
  challenge: CreateChallenge,
  invitedUsers: string[] = [],
) {
  try {
    const req = await Axios.put("/challenges/create", {
      challenge,
      invitedUsers,
    });

    if (req.status !== 200) {
      throw new Error(req.data || "Something went wrong");
    }

    return req.data as Challenge;
  } catch (e) {
    console.error(e);
    return null;
  }
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
