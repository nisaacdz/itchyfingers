export interface UserSchema {
  id: string;
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

export interface TournamentUpcomingSchema {
  id: string;
  name: string;
  description: string;
  max_participants: number;
  current_participants: number;
  status: "waiting" | "active" | "completed";
  scheduled_start?: string;
  created_at: string;
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

export interface SocketApiResponse<T> {
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
