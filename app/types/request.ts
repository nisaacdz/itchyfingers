export type User = {
  userId: string;
  correctPos: number;
  currentPos: number;
  keyStrokes: number;
  speed: number;
  accuracy: number;
  startTime?: Date;
  endTime?: Date;
};

export type Participant = {
  id: string;
  correctPos: number;
  speed: number;
  endTime?: Date;
  accuracy: number;
};

export type ZoneData = {
  user: User;
  participants: Participant[];
  challengeId: string;
  sessionId: string;
};

export enum ChallengePrivacy {
  Invitational = "Invitational",
  Open = "Open",
}

export type Challenge = {
  privacy: ChallengePrivacy;
  challengeId: string;
  createdBy: string;
  scheduledTime: Date;
  duration: number;
  activeParticipants: string[];
};
