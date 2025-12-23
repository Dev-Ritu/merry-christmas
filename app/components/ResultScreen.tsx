"use client";
import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Sparkles, ChevronRight, Gift, Snowflake, Star, Music, Volume2, Trophy, RefreshCcw } from 'lucide-react';

interface ResultProps {
  firstName: string;
  score: number;
  message: string;
  onViewLeaderboard: () => void;
  onExit: () => void;
}

export default function ResultScreen({ firstName, score, message, onViewLeaderboard, onExit }: ResultProps) {
  // --- 3D TILT LOGIC ---
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // --- SOUND EFFECTS LOGIC ---
  useEffect(() => {
    const winSound = new Audio('/sounds/reveal.mp3'); // Add your path here
    winSound.volume = 0.4;
    winSound.play().catch(() => console.log("Audio needs user interaction first"));
  }, []);

  const playClick = () => {
    const clickSound = new Audio('/sounds/click.mp3'); // Add your path here
    clickSound.volume = 0.3;
    clickSound.play().catch(() => {});
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8, rotateY: 90 }} 
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ type: "spring", damping: 15, stiffness: 100 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="relative z-30 perspective-1000"
    >
      {/* 3D Floating Particles around the card */}
      <motion.div 
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 5 }}
        className="absolute -top-12 -right-12 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]"
      >
        <Star size={48} fill="currentColor" />
      </motion.div>

      {/* Main Card Container */}
      <div 
        className="relative bg-[#fffdfa] text-slate-900 p-10 md:p-14 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] text-center max-w-lg mx-4 border-[6px] border-white overflow-hidden"
        style={{ transform: "translateZ(50px)" }} // Pulls content forward
      >
        {/* Festive Red Ribbon Overlay */}
        <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden pointer-events-none">
          <div className="absolute top-6 -right-10 w-40 py-2 bg-red-600 text-white font-black uppercase text-[10px] tracking-widest rotate-45 shadow-lg">
            Gifted
          </div>
        </div>

        {/* Score Badge */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="inline-block bg-slate-900 text-white px-6 py-2 rounded-full font-black text-sm mb-6 shadow-xl"
        >
          🏆 SCORE: {score}
        </motion.div>

        {/* The Message Section with "Inner 3D" depth */}
        <div style={{ transform: "translateZ(80px)" }} className="relative">
          <p className="text-slate-400 uppercase tracking-[0.3em] text-[11px] font-black mb-4">
            For the wonderful {firstName}
          </p>
          
          <div className="relative mb-10">
            <span className="absolute -top-8 -left-2 text-7xl text-red-100 font-serif">“</span>
            <p className="text-3xl font-serif italic text-slate-800 leading-snug px-4 relative z-10">
              {message}
            </p>
            <span className="absolute -bottom-14 -right-2 text-7xl text-red-100 font-serif">”</span>
          </div>
        </div>

        {/* Interactive Buttons */}
        <div className="space-y-4 pt-4" style={{ transform: "translateZ(100px)" }}>
          <motion.button 
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(220,38,38,0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { playClick(); onViewLeaderboard(); }} 
            className="w-full bg-gradient-to-br from-red-600 to-rose-700 text-white py-5 rounded-[2rem] font-black flex items-center justify-center gap-3 transition-all shadow-xl group"
          >
            <Trophy className="group-hover:rotate-12 transition-transform" />
            VIEW LEADERBOARD
            <ChevronRight size={20} />
          </motion.button>
          
          <button 
            onClick={() => { playClick(); onExit(); }} 
            className="w-full text-slate-400 font-black text-xs tracking-widest uppercase py-2 hover:text-red-500 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCcw size={14} /> Try Again
          </button>
        </div>

        {/* Subtle Animated Background Snow inside the card */}
        <div className="absolute inset-0 z-[-1] opacity-[0.03] pointer-events-none">
          <Snowflake className="absolute top-10 left-10 animate-pulse" size={100} />
          <Snowflake className="absolute bottom-10 right-10 animate-pulse" size={120} />
        </div>
      </div>
    </motion.div>
  );
}

// Add these to your global CSS:
// .perspective-1000 { perspective: 1000px; }