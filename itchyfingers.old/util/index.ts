import { TournamentPrivacy, TournamentPrivacyFilter } from "@/types/request";

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const parseTournamentPrivacyFilter = (
  filter: TournamentPrivacyFilter,
) => {
  switch (filter) {
    case TournamentPrivacyFilter.Invitational:
      return TournamentPrivacy.Invitational;
    case TournamentPrivacyFilter.Open:
      return TournamentPrivacy.Open;
    default:
      return undefined;
  }
};
