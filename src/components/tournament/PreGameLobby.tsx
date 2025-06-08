import { TournamentSession } from '@/types/api';
import { Hourglass } from 'lucide-react';
import { TimerDisplay } from './TimerDisplay';

interface PreGameLobbyProps {
  message?: string;
  tournamentSession: TournamentSession | null;
}
export const PreGameLobby = ({ message = "The tournament is about to begin!", tournamentSession }: PreGameLobbyProps) => {
  const scheduledTime = tournamentSession?.scheduled_for;
  return (
    <div className="flex flex-col items-center justify-center text-center h-full p-8 text-slate-200">
      <Hourglass size={64} className="mb-6 text-purple-400 animate-pulse" />
      <h2 className="text-3xl md:text-4xl font-bold mb-3">{message}</h2>
      <p className="text-slate-400 mb-6 max-w-md">
        Get your fingers ready! The typing challenge will appear here once the tournament starts.
        You can see other joined players on the left.
      </p>
      {scheduledTime && new Date(scheduledTime) > new Date() && (
        <div className="text-lg">
          Scheduled to start in: <TimerDisplay targetTime={scheduledTime} mode="countdown" className="font-semibold text-xl text-purple-300" />
        </div>
      )}
    </div>
  );
};