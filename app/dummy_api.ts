import {
  Challenge,
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
const user: UserTyping = {
  userId: "newt",
  correctPos: 0,
  currentPos: 0,
  keyStrokes: 0,
  speed: 0,
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
        id: Math.random().toString(36).substring(7),
        correctPos: 0,
        speed: 30 + Math.random() * 100,
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
        if (participant.correctPos >= len) {
          const fakeParticipantEndTime = new Date();
          fakeParticipant.data.endTime = fakeParticipantEndTime;
          fakeParticipant.data.speed = Math.round(
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

        const remainingChars = len - participant.correctPos;
        const proximityFactor = remainingChars / len;

        const baseSpeedChange = proximityFactor * baseSpeedChangeRate;

        const speedDelta = (Math.random() * 2 - 1) * baseSpeedChange;
        participant.speed = Math.max(0, participant.speed + speedDelta);

        participant.correctPos = Math.min(
          len,
          participant.correctPos +
            Math.ceil(waitTime * ((participant.speed * 5) / 60000)),
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
      id: user.userId,
      correctPos: user.correctPos,
      speed: user.speed,
      endTime: user.endTime,
      accuracy: user.accuracy,
    },
    ...fakeParticipants.map((fakeParticipant) => fakeParticipant.data),
  ];
  let zoneData: ZoneData = {
    user,
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

  if (!user.endTime && !confirm("Are you sure you want to restart?")) return;

  user.correctPos = 0;
  user.currentPos = 0;
  user.keyStrokes = 0;
  user.speed = 0;
  user.accuracy = 100;
  user.endTime = undefined;
  user.startTime = undefined;
  startTime = null;

  fakeParticipants = generateFakeParticipants();

  updateStates();
}

export function handleExitZone() {
  user.correctPos = 0;
  user.currentPos = 0;
  user.keyStrokes = 0;
  user.speed = 0;
  user.accuracy = 100;
  user.startTime = undefined;
  user.endTime = undefined;

  fakeParticipants.forEach((fakeParticipant) => {
    clearInterval(fakeParticipant.intervalId!);
    fakeParticipant.intervalId = undefined;
  });
  startTime = null;
  updateStates();
}

export function handleTypedCharacters(inputString: string) {
  if (user.endTime) return;
  if (!startTime) {
    startRace();
    user.startTime = startTime!;
  }
  const now = Date.now();
  const elapsedTime = startTime ? now - startTime.getTime() : 0;

  for (
    let inputIndex = 0;
    inputIndex < inputString.length && user.correctPos < text.length;
    inputIndex++
  ) {
    const currentChar = inputString[inputIndex];
    if (currentChar === "\b") {
      if (user.currentPos > user.correctPos) {
        user.currentPos--;
      } else if (user.currentPos === user.correctPos) {
        if (user.currentPos > 0 && text[user.currentPos - 1] !== " ") {
          user.currentPos--;
          user.correctPos--;
        }
      }
    } else {
      user.keyStrokes++;

      if (user.currentPos >= text.length) continue;

      if (
        user.correctPos === user.currentPos &&
        currentChar === text[user.currentPos]
      ) {
        user.correctPos++;
        user.currentPos++;
      } else {
        user.currentPos++;
      }
    }
  }

  if (user.correctPos >= text.length) {
    user.endTime = new Date();
  }

  const minutesElapsed = elapsedTime / 60000;
  user.speed =
    minutesElapsed > 0 ? Math.round(user.correctPos / 5 / minutesElapsed) : 0;

  user.accuracy =
    user.keyStrokes === 0
      ? 100
      : Math.round((user.correctPos / user.keyStrokes) * 100);

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
            ),
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
