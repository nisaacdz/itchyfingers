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

/*
correct api types the TournamentSchema below is wrong, it should be like this:
pub struct TournamentSession {
    pub id: String,
    pub scheduled_for: DateTime<Utc>,
    pub started_at: Option<DateTime<Utc>>,
    pub ended_at: Option<DateTime<Utc>>,
    pub text: Option<String>,
    pub current: i32,// represents the number of people
}
*/
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

export type TypeArgs = {
  character: string;
  timestamp: number;
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

export interface HttpResponse<T> {
  success: boolean;
  data: T | null;
  message?: string;
}
