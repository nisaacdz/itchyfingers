export type CreateTournament = {
  kind: "Open" | "Invitational";
  duration: number;
  scheduled_for: string;
  includeSpecialChars: boolean;
  includeUppercase: boolean;
};
