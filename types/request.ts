export type User = {
  userId: string;
  username: string;
  email: string;
};

export const DefaultUserTyping: Participant = {
  username: "newt",
  userId: "",
  correctPosition: 0,
  currentPosition: 0,
  totalKeystrokes: 0,
  wpm: 0,
  accuracy: 0,
};

export type UserProfile = {
  user: User;
  stats: UserStats;
};

export type Participant = {
  userId: string;
  username: string;
  correctPosition: number;
  currentPosition: number;
  totalKeystrokes: number;
  wpm: number;
  accuracy: number;
  startTime?: string;
  endTime?: string;
};

export type StartChallenge = {
  challengeId: string;
  participants: Participant[];
  typingText: string;
};

export type ZoneData = {
  userId: string;
  participants: Record<string, Participant>;
  challengeId: string;
  sessionId: string;
  startTime?: string;
};

export enum ChallengePrivacy {
  Invitational = "Invitational",
  Open = "Open",
}

export enum ChallengePrivacyFilter {
  Invitational = "Invitational",
  Open = "Open",
  All = "All",
}

export enum UserChallengeStatus {
  Pending = "Pending",
  Accepted = "Accepted",
  Declined = "Declined",
  Completed = "Completed",
  Discarded = "Discarded",
}

export type Challenge = {
  privacy: ChallengePrivacy;
  challengeId: string;
  createdBy: User;
  scheduledAt: string;
  startedAt?: string | null;
  duration: number;
  participants: number;
};

export type UserChallenge = {
  challenge: Challenge;
  status: UserChallengeStatus;
  joinedAt?: Date;
  completedAt?: Date;
};

export type UserStats = {
  accuracy: number;
  wpm: number;
  competitions: number;
  keystrokes: number;
  lastActive: string;
};

export interface ApiResponse<T> {
  result: T | null;
  error: string | null;
}

export type ChallengesData = {
  challenges: Challenge[];
  totalPages: number;
};

export type PaginatedData<T> = {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  data: T[];
};

export type ChallengeFilter = {
  privacy?: ChallengePrivacy;
  search?: string;
};

export type UserChallengeFilter = {
  status?: UserChallengeStatus;
  privacy?: ChallengePrivacy;
  search?: string;
};
