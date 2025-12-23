"use client";
import React, { useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  RefreshCcw,
  Snowflake,
  Medal,
  User,
  ChevronRight,
  Crown,
} from "lucide-react";

interface Entry {
  id?: string;
  name: string;
  score: number;
  rank?: number | string;
}

interface LeaderboardProps {
  leaderboard: Entry[];
  currentUser: string;
  onSeekMore: () => void;
  onExit: () => void;
  fetchMore: () => void;
  onBack: () => void;
  userScoreData: any;
  totalPlayers: number;
}

export default function LeaderboardScreen({
  leaderboard,
  currentUser,
  onSeekMore,
  onExit,
  fetchMore,
  userScoreData,
  onBack,
  totalPlayers,
}: LeaderboardProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- ROBUST RANK & SCORE LOGIC ---
  // Inside LeaderboardScreen.tsx userStats useMemo
  const userStats = useMemo(() => {
    return {
      // Use the rank stored in DB, fallback to list index if rank is missing
      rank:
        userScoreData?.rank ??
        (leaderboard.findIndex((u) => u.name === currentUser) + 1 || "N/A"),
      score: userScoreData?.score ?? 0,
    };
  }, [leaderboard, currentUser, userScoreData]);
  // --- INFINITE SCROLL LISTENER ---
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Trigger fetch when user is 50px from the bottom
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      fetchMore();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="z-30 bg-white/10 backdrop-blur-2xl p-5 rounded-[2rem] border border-white/20 shadow-2xl w-full max-w-[320px] mx-auto relative overflow-hidden"
    >
      {/* RESTORED SNOWFLAKE ANIMATION */}
      <motion.div
        animate={{ rotate: 360, opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute -top-10 -right-10 text-white pointer-events-none"
      >
        <Snowflake size={150} />
      </motion.div>

      {/* HEADER */}
      <div className="text-center mb-4 relative z-10">
        <h2 className="text-xl font-black text-white tracking-tighter flex items-center justify-center gap-2 italic">
          <Crown className="text-amber-400" size={18} />
          THE <span className="text-red-500">ELITE</span>
        </h2>
      </div>
      <div className="flex justify-center mb-3">
        <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-full flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">
            {totalPlayers} Players Joined
          </span>
        </div>
      </div>
      {/* TOP USER STATS (Fixed Current User Display) */}
      <div className="mb-4 p-[1px] rounded-xl bg-gradient-to-r from-red-500 via-amber-500 to-red-500 shadow-md">
        <div className="bg-[#0f172a]/90 rounded-[11px] p-3 flex items-center justify-between border border-white/5">
          <div className="flex items-center gap-2 truncate">
            <div className="bg-red-500 p-1.5 rounded-lg shadow-md shrink-0">
              <User size={14} className="text-white" />
            </div>
            <div className="truncate">
              <p className="text-white font-bold text-[11px] truncate leading-tight uppercase tracking-tight">
                {currentUser || "Guest"}
              </p>
              <p className="text-white/40 text-[7px] font-black uppercase tracking-tighter">
                Current Standing
              </p>
            </div>
          </div>
          <div className="text-right shrink-0 ml-2">
            <p className="text-lg font-mono font-black text-white italic leading-none">
              #{userStats.rank}
            </p>
            <p className="text-red-400 text-[8px] font-black uppercase">
              {userStats.score} PTS
            </p>
          </div>
        </div>
      </div>

      {/* SCROLLABLE LIST WITH ON_SCROLL EVENT */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="space-y-1.5 mb-5 max-h-[180px] overflow-y-auto pr-1 custom-scroll relative z-10"
      >
        {leaderboard.map((u, i) => {
          const isMe =
            u.name.trim().toLowerCase() === currentUser.trim().toLowerCase();
          const rank = u?.rank || "N/A";

          return (
            <div
              key={u.id || i}
              className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                isMe
                  ? "bg-white/20 border-white/30"
                  : "bg-white/5 border-white/5"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <div className="w-5 h-5 flex items-center justify-center text-[9px] font-black shrink-0">
                  {rank === 1 ? (
                    <Medal className="text-amber-400" size={14} />
                  ) : rank === 2 ? (
                    <Medal className="text-slate-300" size={14} />
                  ) : rank === 3 ? (
                    <Medal className="text-orange-500" size={14} />
                  ) : (
                    <span className="text-white/20">{rank}</span>
                  )}
                </div>
                <span
                  className={`font-bold text-[10px] truncate ${
                    isMe ? "text-white" : "text-white/60"
                  }`}
                >
                  {u.name}
                </span>
              </div>
              <span
                className={`font-mono font-black text-xs ${
                  rank <= 3 ? "text-amber-400" : "text-white/30"
                }`}
              >
                {u.score}
              </span>
            </div>
          );
        })}
      </div>

      {/* COMPACT BUTTONS */}
      <div className="flex flex-col gap-2 relative z-10">
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onSeekMore}
            className="bg-red-600 text-white py-2.5 rounded-lg font-black text-[8px] uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-md"
          >
            <RefreshCcw size={10} /> RETRY
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onBack} // GO BACK TO RESULT MESSAGE
            className="bg-white/20 text-white py-2.5 rounded-lg font-black text-[8px] uppercase tracking-widest border border-white/10 flex items-center justify-center gap-1"
          >
            <ChevronRight size={10} className="rotate-180" /> BACK
          </motion.button>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onExit}
          className="w-full bg-white/5 text-white/50 py-2.5 rounded-lg font-black text-[8px] uppercase tracking-widest border border-white/10 flex items-center justify-center gap-1"
        >
          EXIT TO HOME
        </motion.button>
      </div>

      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </motion.div>
  );
}
