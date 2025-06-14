export type UserSchema = {
  id: number;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
};

export type ClientSchema = {
  id: string;
  user: UserSchema | null;
  updated: string;
};

/*
pub struct TournamentSchema {
    pub id: String,
    pub title: String,
    pub created_at: DateTimeUtc,
    pub created_by: i32,
    pub scheduled_for: DateTimeUtc,
    pub joined: i32,
    pub privacy: TournamentPrivacy,
    pub text_options: Option<TextOptions>, -- you can ignore this for now
    pub text_id: Option<i32>, -- ignore this
}
*/

export type TournamentSchema = {
  id: string;
  title: string;
  created_at: string;
  crated_by: string;
  scheduled_for: string;
  description: string;
  text_options: unknown,
  privacy: string;
  joined: number,
};

export type WsResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
};

export type TournamentSession = {
  id: string;
  started_at: string | null;
  ended_at: string | null;
  scheduled_for: string;
  text: string;
};

export type TournamentUpcomingSchema = {
  id: string;
  title: string;
  created_at: string;
  created_by: UserSchema;
  scheduled_for: string;
  joined: number;
  privacy: string;
  text_options?: any;
};

export type TypingSessionSchema = {
  client: ClientSchema;
  tournament_id: string;
  current_position: number;
  correct_position: number;
  total_keystrokes: number;
  current_speed: number;
  current_accuracy: number;
  started_at?: string | null;
  ended_at?: string | null;
  last_event_at: string;
};

export type TournamentUpdateSchema = {
  tournament: TournamentSession;
  participants: TypingSessionSchema[];
};

export type SocketResponse<T> = {
  success: boolean;
  data: T | null;
  message: string;
};

export type TypeArgs = {
  character: string;
};

export type LoginSchema = {
  user: UserSchema;
  tokens: {
    access: string;
    refresh: string;
  };
};

export type PaginatedData<T> = {
  data: T[];
  limit: number;
  page: number;
  total: number;
};

export type HttpResponse<T> = {
  success: boolean;
  data: T | null;
  message: string;
};
