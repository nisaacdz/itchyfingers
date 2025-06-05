import {
  TournamentPrivacy,
  DefaultUserTyping,
  Participant,
  UserTournament,
  UserTournamentStatus,
  ZoneData,
  TournamentInfo,
  UserStats,
  Client,
  Tournament,
} from "@/types/request";

// const text2 =
//   "Ipsum dolor sit amet, consectetur adipiscing elit. Sed ac purus sit amet nisl tincidunt tincidunt";

const text =
  "In the land of myth and a time of magic, the destiny of a great kingdom rests on the shoulders of a young boy. His name, Merlin.";

let updateStates: () => void;
const userParticipant: Participant = {
  ...DefaultUserTyping,
};

const userStats: UserStats = {
  accuracy: 92.4,
  wpm: 128,
  competitions: 45,
  keystrokes: 245892,
  lastActive: new Date().toISOString(),
};

const client: Client = {
  client_id: "12345",
  user: {
    id: 123,
    username: "newt",
    email: "newt@domain.xyz",
  },
  updated: new Date().toISOString(),
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
        user_id: Math.random().toString(36).substring(7),
        user_name: null,
        tournament_id: "challenge1",
        current_position: 0,
        correct_position: 0,
        current_speed: 30 + Math.random() * 100,
        current_accuracy: 100,
        total_keystrokes: 0,
        started_at: null,
        ended_at: null,
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
        if (participant.correct_position >= len) {
          const fakeParticipantEndTime = new Date();
          fakeParticipant.data.ended_at = fakeParticipantEndTime.toISOString();
          fakeParticipant.data.current_speed = Math.round(
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

        const remainingChars = len - participant.correct_position;
        const proximityFactor = remainingChars / len;

        const baseSpeedChange = proximityFactor * baseSpeedChangeRate;

        const speedDelta = (Math.random() * 2 - 1) * baseSpeedChange;
        participant.current_speed = Math.max(
          0,
          participant.current_speed + speedDelta,
        );

        participant.correct_position = Math.min(
          len,
          participant.correct_position +
            Math.ceil(waitTime * ((participant.current_speed * 5) / 60000)),
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
    [userParticipant.user_id]: {
      ...userParticipant,
    },
    ...fakeParticipants.reduce(
      (acc, fakeParticipant) => {
        acc[fakeParticipant.data.user_id] = fakeParticipant.data;
        return acc;
      },
      {} as Record<string, Participant>,
    ),
  };
  const zoneData: ZoneData = {
    userId: userParticipant.user_id,
    participants,
    tournamentId: "challenge1",
    sessionId: "challenge1-session1",
    startTime: startTime?.toISOString(),
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

  if (
    !userParticipant.ended_at &&
    !confirm("Are you sure you want to restart?")
  )
    return;

  userParticipant.correct_position = 0;
  userParticipant.current_position = 0;
  userParticipant.total_keystrokes = 0;
  userParticipant.current_speed = 0;
  userParticipant.current_accuracy = 100;
  userParticipant.ended_at = null;
  userParticipant.started_at = null;
  startTime = null;

  fakeParticipants = generateFakeParticipants();

  updateStates();
}

export function handleExitZone() {
  userParticipant.correct_position = 0;
  userParticipant.current_position = 0;
  userParticipant.total_keystrokes = 0;
  userParticipant.current_speed = 0;
  userParticipant.current_accuracy = 100;
  userParticipant.started_at = null;
  userParticipant.ended_at = null;

  fakeParticipants.forEach((fakeParticipant) => {
    clearInterval(fakeParticipant.intervalId!);
    fakeParticipant.intervalId = undefined;
  });
  startTime = null;
  updateStates();
}

export function handleTypedCharacters(inputString: string) {
  if (userParticipant.ended_at) return;
  if (!startTime) {
    startRace();
    userParticipant.started_at = startTime!.toISOString();
  }
  const now = Date.now();
  const elapsedTime = startTime ? now - startTime.getTime() : 0;

  for (
    let inputIndex = 0;
    inputIndex < inputString.length &&
    userParticipant.correct_position < text.length;
    inputIndex++
  ) {
    const currentChar = inputString[inputIndex];
    if (currentChar === "\b") {
      if (userParticipant.current_position > userParticipant.correct_position) {
        userParticipant.current_position--;
      } else if (
        userParticipant.current_position === userParticipant.correct_position
      ) {
        if (
          userParticipant.current_position > 0 &&
          text[userParticipant.current_position - 1] !== " "
        ) {
          userParticipant.current_position--;
          userParticipant.correct_position--;
        }
      }
    } else {
      userParticipant.total_keystrokes++;

      if (userParticipant.current_position >= text.length) continue;

      if (
        userParticipant.correct_position === userParticipant.current_position &&
        currentChar === text[userParticipant.current_position]
      ) {
        userParticipant.correct_position++;
        userParticipant.current_position++;
      } else {
        userParticipant.current_position++;
      }
    }
  }

  if (userParticipant.correct_position >= text.length) {
    userParticipant.ended_at = new Date().toISOString();
  }

  const minutesElapsed = elapsedTime / 60000;
  userParticipant.current_speed =
    minutesElapsed > 0
      ? Math.round(userParticipant.correct_position / 5 / minutesElapsed)
      : 0;

  userParticipant.current_accuracy =
    userParticipant.total_keystrokes === 0
      ? 100
      : Math.round(
          (userParticipant.correct_position /
            userParticipant.total_keystrokes) *
            100,
        );

  updateStates();
}

export async function getCurrentUser() {
  return await new Promise<Client>((resolve) => {
    setTimeout(() => {
      resolve(client);
    }, 1000);
  });
}
