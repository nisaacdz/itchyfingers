// @/components/tournament/elements/GamePhaseDisplay/PostGameSummary.tsx
import { TypingSessionSchema } from '@/types/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Award, Medal, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PostGameSummaryProps {
  participants: Record<string, TypingSessionSchema>;
  currentAuthClientId: string | null;
}

export const PostGameSummary = ({ participants, currentAuthClientId }: PostGameSummaryProps) => {
  const navigate = useNavigate();
  const sortedParticipants = Object.values(participants).sort((a, b) => {
    // Primary sort: finished (ended_at is set)
    const aFinished = !!a.ended_at;
    const bFinished = !!b.ended_at;
    if (aFinished !== bFinished) return aFinished ? -1 : 1; // Finished players first

    // Secondary sort (if both finished or both not): correct_position
    if (a.correct_position !== b.correct_position) return b.correct_position - a.correct_position;
    
    // Tertiary sort (if same progress): time taken (lower is better if finished)
    if (aFinished && bFinished && a.started_at && a.ended_at && b.started_at && b.ended_at) {
        const timeA = new Date(a.ended_at).getTime() - new Date(a.started_at).getTime();
        const timeB = new Date(b.ended_at).getTime() - new Date(b.started_at).getTime();
        if (timeA !== timeB) return timeA - timeB;
    }
    // Final sort: WPM
    return b.current_speed - a.current_speed;
  });

  const getRankIcon = (rank: number) => {
    if (rank === 0) return <Award size={20} className="text-yellow-400" />;
    if (rank === 1) return <Medal size={20} className="text-slate-400" />;
    if (rank === 2) return <Medal size={20} className="text-orange-400" />; // Bronze
    return <span className="font-semibold">{rank + 1}</span>;
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-6 text-slate-100 flex flex-col items-center">
      <Award size={64} className="mb-4 text-amber-400" />
      <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">Tournament Over!</h2>
      <p className="text-slate-300 mb-6 text-center">Well done to all participants! Here are the final standings.</p>
      
      <ScrollArea className="w-full h-[300px] md:h-[400px] border border-slate-700 rounded-md bg-slate-800/50 p-1 custom-scrollbar">
        <Table>
          <TableHeader className="sticky top-0 bg-slate-800/80 backdrop-blur-sm z-10">
            <TableRow className="border-slate-700">
              <TableHead className="w-[60px] text-slate-300 text-center">Rank</TableHead>
              <TableHead className="text-slate-300">Player</TableHead>
              <TableHead className="text-right text-slate-300">WPM</TableHead>
              <TableHead className="text-right text-slate-300">Accuracy</TableHead>
              <TableHead className="text-right text-slate-300">Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedParticipants.map((p, index) => (
              <TableRow
                key={p.client.id}
                className={cn(
                    "border-slate-700",
                    p.client.id === currentAuthClientId && "bg-purple-600/30 hover:bg-purple-600/40"
                )}
              >
                <TableCell className="font-medium text-center">{getRankIcon(index)}</TableCell>
                <TableCell className="font-medium text-slate-200">
                    {p.client.user?.username || `Anon-${p.client.id.substring(0,4)}`}
                </TableCell>
                <TableCell className="text-right">{Math.round(p.current_speed)}</TableCell>
                <TableCell className="text-right">{p.current_accuracy.toFixed(1)}%</TableCell>
                <TableCell className="text-right">{p.correct_position}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      <Button onClick={() => navigate('/tournaments')} className="mt-8 bg-purple-600 hover:bg-purple-700 text-white">
        Find Another Tournament
      </Button>
    </div>
  );
};