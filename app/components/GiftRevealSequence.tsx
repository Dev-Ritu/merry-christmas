"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Sparkles, ChevronRight, Trophy, RefreshCcw, Star, Snowflake } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ResultProps {
  firstName: string;
  score: number;
  message: string;
  onViewLeaderboard: () => void;
  onExit: () => void;
}

export default function GiftRevealSequence({ firstName, score, message, onViewLeaderboard, onExit }: ResultProps) {
  const [isOpened, setIsOpened] = useState(false);

  // --- 3D TILT LOGIC ---
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleOpen = () => {
    setIsOpened(true);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ef4444', '#fbbf24', '#ffffff']
    });
  };

  return (
    <div className="flex items-center justify-center min-h-[500px] perspective-1000 w-full">
      <AnimatePresence mode="wait">
        {!isOpened ? (
          /* --- STAGE 1: THE UNBOXING (Intro Style) --- */
          <motion.div
            key="box"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="text-center cursor-pointer"
            onClick={handleOpen}
          >
            <motion.div
              animate={{ rotate: [0, -3, 3, -3, 3, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="bg-white/10 backdrop-blur-3xl p-12 rounded-[3.5rem] border border-white/20 shadow-2xl"
            >
              <div className="w-40 h-40 bg-red-600 rounded-2xl shadow-2xl relative mx-auto mb-8">
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-6 bg-amber-400" />
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-6 bg-amber-400" />
                <Star className="absolute -top-4 -right-4 text-amber-400 animate-pulse" size={40} fill="currentColor" />
              </div>
              <p className="text-white font-black tracking-[0.2em] text-sm flex items-center gap-3 justify-center">
                <Sparkles size={16} /> TAP TO UNWRAP YOUR GIFT <Sparkles size={16} />
              </p>
            </motion.div>
          </motion.div>
        ) : (
          /* --- STAGE 2: THE RESULT CARD (Glass Theme) --- */
          <motion.div 
            key="result"
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { x.set(0); y.set(0); }}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="relative z-30 w-full max-w-lg"
          >
            {/* The Glass Container */}
            <div className="bg-white/10 backdrop-blur-3xl p-10 md:p-14 rounded-[3.5rem] border border-white/20 shadow-2xl text-center mx-4 relative overflow-hidden">
              
              {/* Inner Decorative Snowflake */}
              <Snowflake className="absolute -top-10 -right-10 text-white/5 rotate-12" size={200} />

              <div style={{ transform: "translateZ(50px)" }}>
                <div className="inline-block bg-red-600 text-white px-8 py-2 rounded-full font-black text-sm mb-8 shadow-lg">
                   SCORE: {score}
                </div>
                
                <p className="text-white/50 uppercase tracking-[0.3em] text-[11px] font-black mb-4">
                  For {firstName}
                </p>
                
                <div className="relative mb-8">
                  <p className="text-xl font-serif italic text-white leading-relaxed px-6 relative z-10 drop-shadow-md">
                    "{message}"
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 pt-4" style={{ transform: "translateZ(80px)" }}>
                <motion.button 
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onViewLeaderboard} 
                  className="w-full bg-white/10 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 border border-white/10 transition-all"
                >
                  View Wall of Souls <ChevronRight size={18} />
                </motion.button>
                
                <button 
                  onClick={onExit} 
                  className="w-full text-white/30 font-black text-xs tracking-widest uppercase py-2 hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCcw size={14} /> Try Again
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}