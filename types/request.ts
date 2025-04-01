export type ClientSchema = {
  client_id: string;
  user: User | null;
  updated: string; // date
};

export type User = {
  id: number;
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

export type StartTournament = {
  tournamentId: string;
  participants: Participant[];
  typingText: string;
};

export type ZoneData = {
  userId: string;
  participants: Record<string, Participant>;
  tournamentId: string;
  sessionId: string;
  startTime?: string;
};

export enum TournamentPrivacy {
  Invitational = "Invitational",
  Open = "Open",
}

export enum TournamentPrivacyFilter {
  Invitational = "Invitational",
  Open = "Open",
  All = "All",
}

export enum UserTournamentStatus {
  Pending = "Pending",
  Accepted = "Accepted",
  Declined = "Declined",
  Completed = "Completed",
  Discarded = "Discarded",
}

export type UserTournament = {
  tournament: TournamentInfo;
  status: UserTournamentStatus;
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

export type TournamentsData = {
  tournaments: TournamentInfo[];
  totalPages: number;
};

export type PaginatedData<T> = {
  page: number;
  limit: number;
  total: number;
  data: T[];
};

export type TournamentFilter = {
  privacy?: TournamentPrivacy;
  search?: string;
};

export type UserTournamentFilter = {
  status?: UserTournamentStatus;
  privacy?: TournamentPrivacy;
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
  scheduled_for: string;
  started_at: string | null;
  ended_at: string | null;
  text: string;
  total_joined: number;
  total_remaining: number;
  total_completed: number;
  automatized: boolean; // maybe remove this from backend
};
