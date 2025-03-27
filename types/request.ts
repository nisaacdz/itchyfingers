export type User = {
  userId: string;
  username: string;
  email: string;
};

export const DefaultUserTyping: Participant = {
  user_id: "kdkd",
  user_name: "newt",
  tournament_id: "dkskdsds",
  started_at: null,
  ended_at: null,
  current_position: 0,
  correct_position: 0,
  total_keystrokes: 0,
  current_accuracy: 100,
  current_speed: 0,
};

export type UserProfile = {
  user: User;
  stats: UserStats;
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

export type Participant = {
  user_id: string;
  user_name: string | null;
  tournament_id: string;
  started_at: string | null;
  ended_at: string | null;
  current_position: number;
  correct_position: number;
  total_keystrokes: number;
  current_accuracy: number;
  current_speed: number;
};

export type TournamentInfo = {
  id: string;
  started_at: string | null;
  ended_at: string | null;
  text: string;
  total_joined: number;
  total_remaining: number;
  total_completed: number;
  automatized: boolean;
};
