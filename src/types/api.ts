export type UserSchema = {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type ClientSchema = {
  id: string;
  user: UserSchema | null;
  updated: string;
};

export type TextOptions = {
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  meaningful: boolean;
};

export type TournamentStatus = "upcoming" | "started" | "ended";
export type TournamentPrivacy = "open" | "invitational";

export type Tournament = {
  id: string;
  title: string;
  creator: string;
  scheduledFor: string;
  description: string;
  privacy: TournamentPrivacy;
  textOptions: TextOptions | null;
  startedAt: string | null;
  endedAt: string | null;
  participating: boolean;
  participantCount: number;
}

export type CreatedTournament = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  createdBy: string;
  scheduledFor: string,
  privacy: TournamentPrivacy,
  textOptions: TextOptions | null;
}

export type TournamentData = {
  id: string;
  title: string;
  creator: string; // username of the creator
  scheduledFor: string;
  description: string;
  textOptions: TextOptions | null;
  privacy: TournamentPrivacy;
  startedAt: string | null;
  endedAt: string | null;
  text: string | null;
};

export type ParticipantData = {
  client: ClientSchema;
  currentPosition: number;
  correctPosition: number;
  totalKeystrokes: number;
  currentSpeed: number;
  currentAccuracy: number;
  startedAt: string | null;
  endedAt: string | null;
};

export type ParticipantUpdate = {
  updates: Partial<Omit<ParticipantData, "client">>;
};

export type WsFailurePayload = {
  code: number;
  message: string;
};

export type PollableEvent = "me" | "all" | "data" | "check" | "leave";

export type TypeEventPayload = {
  character: string;
};

export type JoinSuccessPayload = {
  data: TournamentData;
  clientId: string;
  participants: ParticipantData[];
};

export type MeSuccessPayload = ParticipantData;

export type UpdateMePayload = ParticipantUpdate;

export type AllSuccessPayload = ParticipantData[];

type PartialParticipantDataForUpdate = {
  clientId: string;
} & ParticipantUpdate;

export type UpdateAllPayload = {
  updates: PartialParticipantDataForUpdate[];
};

export type DataSuccessPayload = TournamentData;

export type UpdateDataPayload = {
  updates: Partial<
    Omit<TournamentData, "id" | "createdAt" | "createdBy">
  >;
}

export type CheckSuccessPayload = {
  status: TournamentStatus;
};

export type MemberJoinedPayload = {
  participant: ParticipantData;
};

export type MemberLeftPayload = {
  clientId: string;
};

export type LeaveSuccessPayload = {
  message: string;
};

export type LoginSchema = {
  user: UserSchema;
  tokens: {
    access: string;
    refresh: string;
  };
};

export type Pagination<T> = {
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
