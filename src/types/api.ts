export interface UserSchema {
  id: number;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface ClientSchema {
  id: string;
  user: UserSchema | null;
  created_at: string;
  updated_at: string;
}

export interface TournamentSchema {
  id: string;
  name: string;
  description: string;
  text: string;
  max_participants: number;
  status: "waiting" | "active" | "completed";
  created_at: string;
  updated_at: string;
  scheduled_start?: string;
}
/*
correct api types
pub struct TournamentUpcomingSchema {
    pub id: String,
    pub title: String,
    pub created_at: DateTimeUtc,
    pub created_by: UserSchema,
    pub scheduled_for: DateTimeUtc,
    pub joined: i32,
    pub privacy: TournamentPrivacy,
    pub text_options: Option<TextOptions>,
}
*/
export interface TournamentUpcomingSchema {
  id: string;
  title: string;
  created_at: string;
  created_by: UserSchema;
  scheduled_for: string;
  joined: number;
  privacy: string;
  text_options?: any;
}

export interface TypingSessionSchema {
  id: string;
  tournament_id: string;
  client: ClientSchema;
  current_position: number;
  current_speed: number;
  current_accuracy: number;
  created_at: string;
  updated_at: string;
}

export interface SocketResponse<T> {
  success: boolean;
  data: T | null;
  message?: string;
}

export interface TypeArgs {
  character: string;
  timestamp: number;
}

export interface LoginSchema {
  user: UserSchema;
  tokens: {
    access: string;
    refresh: string;
  };
}

export interface PaginatedData<T> {
  data: T[];
  limit: number;
  page: number;
  total: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message?: string;
}
