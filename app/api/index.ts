import { Challenge, Participant, User } from "../types/request";
import { Axios } from "../util/axios";

export { typingSocketAPI } from "./socket";

export async function getTypingText(challengeId: string) {
  try {
    const req = await Axios.get(`challenges/${challengeId}/text`);

    if (req.status !== 200) {
      throw new Error("Failed to fetch typing text");
    }

    return (req.data.text || "") as string;
  } catch (e) {
    throw e as Error;
  }
}

export async function fetchChallenges({ pageParam = 1, pageSize = 10 }) {
  try {
    const req = await Axios.get("/challenges", {
      params: {
        page: pageParam,
        pageSize,
      },
    });

    if (req.status !== 200) {
      throw new Error("Failed to fetch challenges");
    }

    return req.data as { challenges: Challenge[]; totalPages: number };
  } catch (e) {
    throw e as Error;
  }
}

export async function fetchUserSession(challengeId: string, userId: string) {
  try {
    const req = await Axios.get(`/typingsessions/${challengeId}/${userId}`);

    if (req.status !== 200) {
      throw new Error("Failed to fetch typing session");
    }

    return req.data as Participant | null;
  } catch (e) {
    throw e as Error;
  }
}

export async function fetchChallenge(challengeId: string) {
  try {
    const req = await Axios.get(`/challenges/${challengeId}`);

    if (req.status !== 200) {
      throw new Error("Failed to fetch challenge");
    }

    return req.data as Challenge;
  } catch (e) {
    throw e as Error;
  }
}

export async function enterChallenge(challengeId: string) {
  try {
    const req = await Axios.patch(`/challenges/${challengeId}/enter`);

    if (req.status !== 200) {
      throw new Error("Failed to enter challenge");
    }

    return req.data as Challenge;
  } catch (e) {
    throw e as Error;
  }
}

export async function getCurrentUser() {
  try {
    const req = await Axios.get(`/user`);

    if (req.status !== 200) {
      throw new Error("Failed to retrieve user session");
    }
    return req.data as User | null;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function loginUser() {
  try {
    const req = await Axios.patch(`/login`);
    // server should redirect (yes server should redirect the client to login page)
    // after login it should go back to where the page was

    if (req.status !== 200) {
      throw new Error("Failed to retrieve user session");
    }
    return req.data as User | null;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function logoutUser() {
  try {
    const req = await Axios.patch(`/logout`);

    if (req.status !== 200) {
      throw new Error("Failed to retrieve user session");
    }
  } finally {
    return null;
  }
}

export async function fetchSessionParticipants(challengeId: string) {
  try {
    const req = await Axios.get(`/challenges/${challengeId}/participants`);

    if (req.status !== 200) {
      throw new Error("Failed to fetch participants");
    }
    return req.data as Participant[];
  } catch (e) {
    throw e as Error;
  }
}
