export type User = {
    id: string;
};

export type UserProgress = {
    userId: string,
    currentPos: number,
    totalCount: number,
    speed: number,
}

export type ZoneData = {
    userProgress: UserProgress,
    participants: UserProgress[],
    challengeId: string,
    sessionId: string,
}