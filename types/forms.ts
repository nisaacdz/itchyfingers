export type CreateChallenge = {
  challengeType: "Open" | "Invitational";
  duration: number;
  startTime: string;
  includeSpecialChars: boolean;
  includeUppercase: boolean;
};