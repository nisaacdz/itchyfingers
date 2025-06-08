// @/components/tournament/layout/MainContentLayout.tsx
import React from 'react';

interface MainContentLayoutProps {
  statsSlot: React.ReactNode;
  participantsSlot: React.ReactNode;
  mainChallengeSlot: React.ReactNode;
}

export const MainContentLayout = ({
  statsSlot,
  participantsSlot,
  mainChallengeSlot,
}: MainContentLayoutProps) => {
  return (
    <main className="flex-grow grid grid-cols-1 md:grid-cols-12 gap-4 p-3 md:p-4 overflow-hidden">
      {/* Left Column: Stats & Participants */}
      <aside className="md:col-span-3 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1">
        <div className="bg-slate-800/60 p-4 rounded-lg shadow-md backdrop-blur-sm">{statsSlot}</div>
        <div className="bg-slate-800/60 p-4 rounded-lg shadow-md backdrop-blur-sm flex-grow min-h-[200px]">
          {participantsSlot}
        </div>
      </aside>

      {/* Right Column: Main Typing Challenge Area */}
      <section className="md:col-span-9 bg-slate-800/70 p-4 md:p-6 rounded-lg shadow-xl backdrop-blur-md flex flex-col items-center justify-center overflow-hidden">
        {mainChallengeSlot}
      </section>
    </main>
  );
};
// Add to your global.css or styles/globals.css for custom scrollbar (optional)
/*
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #4A5568; // slate-600
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #718096; // slate-500
}
*/