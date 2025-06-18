export type Client = {
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
  tournament: Tournament;
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

export type Pagination<T> = {
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

export class TextOptions {
  constructor(
    public upper_case: boolean,
    public lower_case: boolean,
    public numbers: boolean,
    public symbols: boolean,
    public meaningful_words: boolean,
  ) {}

  display(): string {
    const options: string[] = [];
    if (this.upper_case) options.push("Uppercase");
    if (this.lower_case) options.push("Lowercase");
    if (this.numbers) options.push("Numbers");
    if (this.symbols) options.push("Symbols");
    if (!this.meaningful_words) options.push("Random");

    if (options.length === 0) options.push("None");
    return options.join(", ");
  }
}

export type Tournament = {
  id: string;
  title: string;
  created_by: User;
  created_at: string;
  scheduled_for: string;
  joined: number;
  privacy: TournamentPrivacy;
  text_options: TextOptions;
};

export type TournamentInfo = {
  id: string;
  scheduled_for: string;
  started_at: string | null;
  ended_at: string | null;
  text: string;
  joined: number;
  total_remaining: number;
  total_completed: number;
};
