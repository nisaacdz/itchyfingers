export type User = {
  userId: string;
  username: string;
  email: string;
};

export type UserTyping = {
  userId: string;
  correctPosition: number;
  currentPosition: number;
  totalKeystrokes: number;
  wpm: number;
  accuracy: number;
  startTime?: string;
  endTime?: string;
};

export const DefaultUserTyping: UserTyping = {
  userId: "",
  correctPosition: 0,
  currentPosition: 0,
  totalKeystrokes: 0,
  wpm: 0,
  accuracy: 0,
};

export type UserProfile = {
  username: string;
  email: string;
  stats: {
    accuracy: number;
    speed: number;
    competitions: number;
    keystrokes: number;
  };
};

export type Participant = {
  userId: string;
  username: string;
  correctPosition: number;
  wpm: number;
  endTime?: string;
  startTime?: string;
  accuracy: number;
};

export type ZoneData = {
  userTyping: UserTyping;
  participants: Participant[];
  challengeId: string;
  sessionId: string;
};

export enum ChallengePrivacy {
  Invitational = "Invitational",
  Open = "Open",
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
