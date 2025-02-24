import {
  ChallengePrivacy,
  Participant,
  UserChallenge,
  UserChallengeStatus,
  UserProfile,
  ZoneData,
} from "./types/request";

// const text2 =
//   "Ipsum dolor sit amet, consectetur adipiscing elit. Sed ac purus sit amet nisl tincidunt tincidunt";

const text =
  "In the land of myth and a time of magic, the destiny of a great kingdom rests on the shoulders of a young boy. His name, Merlin.";

let updateStates: () => void;
const userParticipant: Participant = {
  userId: "newt",
  username: "newt",
  correctPosition: 0,
  currentPosition: 0,
  totalKeystrokes: 0,
  wpm: 0,
  accuracy: 100,
};

const userProfile: UserProfile = {
  username: "typespeedmaster",
  email: "master@typing.io",
  stats: {
    accuracy: 92.4,
    speed: 128,
    competitions: 45,
    keystrokes: 245892,
  },
};

const loading = false;
const error = false;
let startTime: Date | undefined | null;

type FakeParticipant = {
  intervalId?: NodeJS.Timeout;
  data: Participant;
};

let fakeParticipants: FakeParticipant[] = generateFakeParticipants();

function generateFakeParticipants() {
  const numParticipants = Math.floor(Math.random() * 4) + 1;
  return Array.from({ length: numParticipants }, () => {
    return {
      data: {
        userId: Math.random().toString(36).substring(7),
        username: Math.random().toString(36).substring(7),
        correctPosition: 0,
        wpm: 30 + Math.random() * 100,
        accuracy: 100,
        totalKeystrokes: 0,
        currentPosition: 0,
      },
    };
  });
}

function startRace() {
  startTime = new Date();
  Promise.all([
    fakeParticipants.map((fakeParticipant) => {
      const participant = fakeParticipant.data;

      if (fakeParticipant.intervalId) return;
      const waitTime = 100 + Math.random() * 300;
      // Represents the maximum |speed change| after waitTime, will be in [2, 10]
      const baseSpeedChangeRate = 2 + (Math.random() * waitTime) / 50;

      const continueTyping = () => {
        const len = text.length;
        if (participant.correctPosition >= len) {
          const fakeParticipantEndTime = new Date();
          fakeParticipant.data.endTime = fakeParticipantEndTime.toISOString();
          fakeParticipant.data.wpm = Math.round(
            (len /
              5 /
              (fakeParticipantEndTime.getTime() - startTime!.getTime())) *
              60000,
          );
          clearInterval(fakeParticipant.intervalId);
          fakeParticipant.intervalId = undefined;
          updateStates();
          return;
        }

        const remainingChars = len - participant.correctPosition;
        const proximityFactor = remainingChars / len;

        const baseSpeedChange = proximityFactor * baseSpeedChangeRate;

        const speedDelta = (Math.random() * 2 - 1) * baseSpeedChange;
        participant.wpm = Math.max(0, participant.wpm + speedDelta);

        participant.correctPosition = Math.min(
          len,
          participant.correctPosition +
            Math.ceil(waitTime * ((participant.wpm * 5) / 60000)),
        );

        updateStates();
      };

      fakeParticipant.intervalId = setInterval(continueTyping, waitTime);
    }),
  ]);
}

export function initialize(updateFn: () => void) {
  // updateStates is used to simulate emitting of 'update' event
  // to trigger re-rendering of the component
  updateStates = updateFn;
}

export function getTypingText() {
  return text;
}

export function getZoneData() {
  const participants = {
    [userParticipant.userId]: {
      userId: userParticipant.userId,
      username: userProfile.username,
      correctPosition: userParticipant.correctPosition,
      wpm: userParticipant.wpm,
      endTime: userParticipant.endTime,
      accuracy: userParticipant.accuracy,
      totalKeystrokes: userParticipant.totalKeystrokes,
      currentPosition: userParticipant.currentPosition,
    },
    ...fakeParticipants.reduce(
      (acc, fakeParticipant) => {
        acc[fakeParticipant.data.userId] = fakeParticipant.data;
        return acc;
      },
      {} as Record<string, Participant>,
    ),
  };
  const zoneData: ZoneData = {
    userId: userParticipant.userId,
    participants,
    challengeId: "challenge1",
    sessionId: "challenge1-session1",
  };
  return zoneData;
}

export function getEverything() {
  return { zoneData: getZoneData(), loading, error };
}

export function handleRestartZone() {
  if (fakeParticipants.some((fakeParticipant) => fakeParticipant.intervalId)) {
    return alert(
      "Wait for all participants to finish typing before restarting",
    );
  }

  if (!userParticipant.endTime && !confirm("Are you sure you want to restart?"))
    return;

  userParticipant.correctPosition = 0;
  userParticipant.currentPosition = 0;
  userParticipant.totalKeystrokes = 0;
  userParticipant.wpm = 0;
  userParticipant.accuracy = 100;
  userParticipant.endTime = undefined;
  userParticipant.startTime = undefined;
  startTime = null;

  fakeParticipants = generateFakeParticipants();

  updateStates();
}

export function handleExitZone() {
  userParticipant.correctPosition = 0;
  userParticipant.currentPosition = 0;
  userParticipant.totalKeystrokes = 0;
  userParticipant.wpm = 0;
  userParticipant.accuracy = 100;
  userParticipant.startTime = undefined;
  userParticipant.endTime = undefined;

  fakeParticipants.forEach((fakeParticipant) => {
    clearInterval(fakeParticipant.intervalId!);
    fakeParticipant.intervalId = undefined;
  });
  startTime = null;
  updateStates();
}

export function handleTypedCharacters(inputString: string) {
  if (userParticipant.endTime) return;
  if (!startTime) {
    startRace();
    userParticipant.startTime = startTime!.toISOString();
  }
  const now = Date.now();
  const elapsedTime = startTime ? now - startTime.getTime() : 0;

  for (
    let inputIndex = 0;
    inputIndex < inputString.length &&
    userParticipant.correctPosition < text.length;
    inputIndex++
  ) {
    const currentChar = inputString[inputIndex];
    if (currentChar === "\b") {
      if (userParticipant.currentPosition > userParticipant.correctPosition) {
        userParticipant.currentPosition--;
      } else if (
        userParticipant.currentPosition === userParticipant.correctPosition
      ) {
        if (
          userParticipant.currentPosition > 0 &&
          text[userParticipant.currentPosition - 1] !== " "
        ) {
          userParticipant.currentPosition--;
          userParticipant.correctPosition--;
        }
      }
    } else {
      userParticipant.totalKeystrokes++;

      if (userParticipant.currentPosition >= text.length) continue;

      if (
        userParticipant.correctPosition === userParticipant.currentPosition &&
        currentChar === text[userParticipant.currentPosition]
      ) {
        userParticipant.correctPosition++;
        userParticipant.currentPosition++;
      } else {
        userParticipant.currentPosition++;
      }
    }
  }

  if (userParticipant.correctPosition >= text.length) {
    userParticipant.endTime = new Date().toISOString();
  }

  const minutesElapsed = elapsedTime / 60000;
  userParticipant.wpm =
    minutesElapsed > 0
      ? Math.round(userParticipant.correctPosition / 5 / minutesElapsed)
      : 0;

  userParticipant.accuracy =
    userParticipant.totalKeystrokes === 0
      ? 100
      : Math.round(
          (userParticipant.correctPosition / userParticipant.totalKeystrokes) *
            100,
        );

  updateStates();
}

export async function fetchUserChallenges({ pageParam = 1, pageSize = 10 }) {
  const userChallenges = await new Promise<UserChallenge[]>((resolve) => {
    setTimeout(() => {
      const mockUserChallenges = Array.from({ length: pageSize }).map(() => {
        const participants = Math.floor(Math.random() * 10);
        const challenge = {
          challengeId: Math.random().toString(36).substring(7),
          createdBy: { userId: "newt", username: "newt", email: "newt@newt" },
          scheduledAt: new Date(
            Date.now() + 15000 + Math.floor(Math.random() * 600000),
          ).toISOString(),
          privacy: ChallengePrivacy.Invitational,
          duration: 10 + Math.floor(Math.random() * 100),
          participants,
        };

        let status = UserChallengeStatus.Pending;
        const random = Math.random();
        if (random < 0.2) {
          status = UserChallengeStatus.Accepted;
        } else if (random < 0.4) {
          status = UserChallengeStatus.Declined;
        } else if (random < 0.6) {
          status = UserChallengeStatus.Completed;
        } else if (random < 0.8) {
          status = UserChallengeStatus.Discarded;
        }

        let joinedAt: Date | undefined = undefined;
        if (status === UserChallengeStatus.Accepted && Math.random() > 0.5) {
          joinedAt = new Date(
            Date.now() - 15000 - Math.floor(Math.random() * 600000),
          );
        }

        let completedAt: Date | undefined = undefined;

        if (joinedAt && Math.random() > 0.5) {
          completedAt = new Date(
            joinedAt.getTime() + 15000 + Math.floor(Math.random() * 600000),
          );
        }

        return { challenge, joinedAt, completedAt, status };
      });
      resolve(mockUserChallenges);
    }, 1000);
  });

  return {
    userChallenges,
    page: pageParam,
    pageSize,
    totalPages: 13,
  };
}

export async function getCurrentUser() {
  return await new Promise<UserProfile>((resolve) => {
    setTimeout(() => {
      resolve(userProfile);
    }, 1000);
  });
}
