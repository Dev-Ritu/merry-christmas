"use client";
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw, Star, Snowflake, Medal, User, ChevronRight, Crown } from 'lucide-react';

interface Entry {
  name: string;
  score: number;
}

interface LeaderboardProps {
  leaderboard: Entry[];
  currentUser: string;
  onSeekMore: () => void;
  onExit: () => void;
}

export default function LeaderboardScreen({ leaderboard, currentUser, onSeekMore, onExit }: LeaderboardProps) {
  
  // --- ROBUST RANK & SCORE LOGIC ---
  const userStats = useMemo(() => {
    if (!leaderboard || leaderboard.length === 0) return { rank: "N/A", score: 0 };

    const cleanUser = currentUser.trim().toLowerCase();
    
    // Sort descending by score
    const sorted = [...leaderboard].sort((a, b) => b.score - a.score);
    
    // Find matching user
    const index = sorted.findIndex(u => u.name.trim().toLowerCase() === cleanUser);
    
    if (index === -1) return { rank: "N/A", score: 0 };
    
    return {
      rank: index + 1, // Fixes the 0 rank issue
      score: sorted[index].score
    };
  }, [leaderboard, currentUser]);

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

      {/* TOP USER STATS (Current User) */}
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
              <p className="text-white/40 text-[7px] font-black uppercase tracking-tighter">Current Standing</p>
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

      {/* SCROLLABLE LIST */}
      <div className="space-y-1.5 mb-5 max-h-[180px] overflow-y-auto pr-1 custom-scroll relative z-10">
        {leaderboard.map((u, i) => {
          const isMe = u.name.trim().toLowerCase() === currentUser.trim().toLowerCase();
          const rank = i + 1;

          return (
            <div 
              key={i} 
              className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                isMe 
                ? 'bg-white/20 border-white/30' 
                : 'bg-white/5 border-white/5'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <div className="w-5 h-5 flex items-center justify-center text-[9px] font-black shrink-0">
                  {rank === 1 ? <Medal className="text-amber-400" size={14} /> : 
                   rank === 2 ? <Medal className="text-slate-300" size={14} /> :
                   rank === 3 ? <Medal className="text-orange-500" size={14} /> :
                   <span className="text-white/20">{rank}</span>}
                </div>
                <span className={`font-bold text-[10px] truncate ${isMe ? 'text-white' : 'text-white/60'}`}>
                  {u.name}
                </span>
              </div>
              <span className={`font-mono font-black text-xs ${rank <= 3 ? 'text-amber-400' : 'text-white/30'}`}>
                {u.score}
              </span>
            </div>
          );
        })}
      </div>

      {/* COMPACT BUTTONS */}
      <div className="grid grid-cols-2 gap-2 relative z-10">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={onSeekMore} 
          className="bg-red-600 text-white py-2.5 rounded-lg font-black text-[8px] uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-md"
        >
          <RefreshCcw size={10} /> RETRY
        </motion.button>
        
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={onExit} 
          className="bg-white/5 text-white/50 py-2.5 rounded-lg font-black text-[8px] uppercase tracking-widest border border-white/10 flex items-center justify-center gap-1"
        >
          EXIT <ChevronRight size={10} />
        </motion.button>
      </div>

      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar { width: 2px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
      `}</style>
    </motion.div>
  );
}