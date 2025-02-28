import { ChallengePrivacy, ChallengePrivacyFilter } from "@/types/request";

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const parseChallengePrivacyFilter = (filter: ChallengePrivacyFilter) => {
  switch (filter) {
    case ChallengePrivacyFilter.Invitational:
      return ChallengePrivacy.Invitational;
    case ChallengePrivacyFilter.Open:
      return ChallengePrivacy.Open;
    default:
      return undefined;
  }
};
