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

export type TournamentSchema = {
  id: string;
  name: string;
  description: string;
  text: string;
  max_participants: number;
  status: "waiting" | "active" | "completed";
  created_at: string;
  updated_at: string;
  scheduled_start?: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T | null;
  error_code?: string | null;
};

export type TournamentSession = {
  id: string;
  started_at?: string | null;
  ended_at?: string | null;
  scheduled_for: string;
  text?: string | null;
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
  message?: string;
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
  message?: string;
};
