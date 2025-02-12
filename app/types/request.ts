export type User = {
  userId: string;
  username: string;
  email: string;
};

export type UserTyping = {
  userId: string;
  correctPos: number;
  currentPos: number;
  keyStrokes: number;
  speed: number;
  accuracy: number;
  startTime?: Date;
  endTime?: Date;
};

export const DefaultUserTyping: UserTyping = {
  userId: "",
  correctPos: 0,
  currentPos: 0,
  keyStrokes: 0,
  speed: 0,
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
  id: string;
  correctPos: number;
  speed: number;
  endTime?: Date;
  accuracy: number;
};

export type ZoneData = {
  user: UserTyping;
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
  scheduledAt: string; // iso date string
  startedAt: string | null; // iso date string
  duration: number;
  participants: number;
};

export type UserChallenge = {
  challenge: Challenge;
  status: UserChallengeStatus;
  joinedAt?: Date;
  completedAt?: Date;
};
