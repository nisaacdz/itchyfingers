export type CreateTournament = {
  title: string;
  kind: "Open" | "Invitational";
  duration: number;
  scheduled_for: string;
  includeSpecialChars: boolean;
  includeUppercase: boolean;
};
