import {
  ChallengePrivacy,
  Participant,
  UserTyping,
  UserChallenge,
  UserChallengeStatus,
  UserProfile,
  ZoneData,
} from "./types/request";

const text2 =
  "Ipsum dolor sit amet, consectetur adipiscing elit. Sed ac purus sit amet nisl tincidunt tincidunt";

const text =
  "In the land of myth and a time of magic, the destiny of a great kingdom rests on the shoulders of a young boy. His name, Merlin.";

let updateStates: () => void;
const userTyping: UserTyping = {
  userId: "newt",
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

let loading = false;
let error = false;
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
  let participants = [
    {
      userId: userTyping.userId,
      username: userProfile.username,
      correctPosition: userTyping.correctPosition,
      wpm: userTyping.wpm,
      endTime: userTyping.endTime,
      accuracy: userTyping.accuracy,
    },
    ...fakeParticipants.map((fakeParticipant) => fakeParticipant.data),
  ];
  let zoneData: ZoneData = {
    userTyping,
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

  if (!userTyping.endTime && !confirm("Are you sure you want to restart?"))
    return;

  userTyping.correctPosition = 0;
  userTyping.currentPosition = 0;
  userTyping.totalKeystrokes = 0;
  userTyping.wpm = 0;
  userTyping.accuracy = 100;
  userTyping.endTime = undefined;
  userTyping.startTime = undefined;
  startTime = null;

  fakeParticipants = generateFakeParticipants();

  updateStates();
}

export function handleExitZone() {
  userTyping.correctPosition = 0;
  userTyping.currentPosition = 0;
  userTyping.totalKeystrokes = 0;
  userTyping.wpm = 0;
  userTyping.accuracy = 100;
  userTyping.startTime = undefined;
  userTyping.endTime = undefined;

  fakeParticipants.forEach((fakeParticipant) => {
    clearInterval(fakeParticipant.intervalId!);
    fakeParticipant.intervalId = undefined;
  });
  startTime = null;
  updateStates();
}

export function handleTypedCharacters(inputString: string) {
  if (userTyping.endTime) return;
  if (!startTime) {
    startRace();
    userTyping.startTime = startTime!.toISOString();
  }
  const now = Date.now();
  const elapsedTime = startTime ? now - startTime.getTime() : 0;

  for (
    let inputIndex = 0;
    inputIndex < inputString.length && userTyping.correctPosition < text.length;
    inputIndex++
  ) {
    const currentChar = inputString[inputIndex];
    if (currentChar === "\b") {
      if (userTyping.currentPosition > userTyping.correctPosition) {
        userTyping.currentPosition--;
      } else if (userTyping.currentPosition === userTyping.correctPosition) {
        if (
          userTyping.currentPosition > 0 &&
          text[userTyping.currentPosition - 1] !== " "
        ) {
          userTyping.currentPosition--;
          userTyping.correctPosition--;
        }
      }
    } else {
      userTyping.totalKeystrokes++;

      if (userTyping.currentPosition >= text.length) continue;

      if (
        userTyping.correctPosition === userTyping.currentPosition &&
        currentChar === text[userTyping.currentPosition]
      ) {
        userTyping.correctPosition++;
        userTyping.currentPosition++;
      } else {
        userTyping.currentPosition++;
      }
    }
  }

  if (userTyping.correctPosition >= text.length) {
    userTyping.endTime = new Date().toISOString();
  }

  const minutesElapsed = elapsedTime / 60000;
  userTyping.wpm =
    minutesElapsed > 0
      ? Math.round(userTyping.correctPosition / 5 / minutesElapsed)
      : 0;

  userTyping.accuracy =
    userTyping.totalKeystrokes === 0
      ? 100
      : Math.round(
          (userTyping.correctPosition / userTyping.totalKeystrokes) * 100,
        );

  updateStates();
}

export async function fetchUserChallenges({ pageParam = 1, pageSize = 10 }) {
  const userChallenges = await new Promise<UserChallenge[]>((resolve) => {
    setTimeout(() => {
      const mockUserChallenges = Array.from({ length: pageSize }).map(
        (_, index) => {
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
        },
      );
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
