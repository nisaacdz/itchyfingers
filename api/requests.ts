import Api from ".";
import { CreateChallenge } from "../types/forms";
import {
  ApiResponse,
  Challenge,
  ChallengesData,
  Participant,
  User,
} from "../types/request";
import { Axios } from "../util/axios";

export { typingSocketAPI } from "./socket";

export async function getTypingText(challengeId: string) {
  try {
    const req = await Axios.get(`challenges/${challengeId}/text`);

    if (req.status !== 200) {
      throw new Error(req.data || "Something went wrong");
    }

    return (req.data.text || "") as string;
  } catch (e) {
    throw e as Error;
  }
}

export async function fetchChallenges({
  page = 1,
  pageSize = 10,
  search = "",
  filter = "",
}) {
  return await Api.get<ChallengesData>("/challenges", {
    params: {
      page,
      pageSize,
      search: search || undefined,
      filter: filter || undefined,
    },
  });
}

export async function fetchUserSession(challengeId: string, userId: string) {
  try {
    const req = await Axios.get(`/typingsessions/${challengeId}/${userId}`);

    if (req.status !== 200) {
      throw new Error(req.data || "Something went wrong");
    }

    return req.data as Participant | null;
  } catch (e) {
    throw e as Error;
  }
}

export async function fetchChallenge(challengeId: string) {
  return (await Api.get<Challenge>(`/challenges/${challengeId}`)).result;
}

export async function enterChallenge(challengeId: string) {
  return (await Api.patch<Challenge>(`/challenges/${challengeId}/enter`, {}))
    .result;
}

export async function getCurrentUser() {
  const user = await Api.get<User>("/current");
  return user.result;
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
  return await Api.patch<{}>("/auth/logout", {});
}

export async function fetchSessionParticipants(challengeId: string) {
  try {
    const req = await Axios.get(`/challenges/${challengeId}/participants`);

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
  invitedUsers: string[] = []
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
