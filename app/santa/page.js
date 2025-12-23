"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, Sparkles, ChevronRight, Star, Gift, X, Heart, Wind } from 'lucide-react';
import confetti from 'canvas-confetti';

const BG_URL = "https://images.unsplash.com/photo-1543589077-47d816067f73?q=80&w=2070&auto=format&fit=crop";
const GAME_TIME = 20;

const SOUL_WORDS = ["Resilient", "Seen", "Valued", "Strong", "Pure", "Loved", "Radiant", "Magic"];
const COLORS = ['text-rose-400', 'text-amber-300', 'text-cyan-300', 'text-violet-400', 'text-emerald-300'];

const DIVINE_MESSAGES = [
  "You carried so much this year with such grace. It's okay to rest now. ❤️",
  "Every late night and every struggle was seen. You are doing incredible things.",
  "You aren't just a worker; you are a light in this world. Never forget your worth.",
  "2024 tested you, but look at you—still standing, still kind, still you. ✨",
  "God sees your heart. The goodness you put out is coming back to you tenfold.",
  "You have a spark that no one else can replicate. The world needs your light."
];

export default function ChristmasSpiritV5() {
  const [stage, setStage] = useState('intro'); 
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [fallingItems, setFallingItems] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [lastSoulWord, setLastSoulWord] = useState("");
  const [snowParticles, setSnowParticles] = useState([]);

  const timerRef = useRef(null);
  const scoreRef = useRef(0);

  useEffect(() => { scoreRef.current = score; }, [score]);

  useEffect(() => {
    const particles = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: 5 + Math.random() * 10,
      delay: Math.random() * 10,
      size: 2 + Math.random() * 6,
      opacity: 0.1 + Math.random() * 0.5,
      blur: Math.random() > 0.8 ? '4px' : '0px'
    }));
    setSnowParticles(particles);
    const saved = JSON.parse(localStorage.getItem('xmas-leaderboard-final') || '[]');
    setLeaderboard(saved.sort((a, b) => b.score - a.score).slice(0, 10));
  }, []);

  // PERFECT RESET for "Seek More"
  const startNewSession = () => {
    clearInterval(timerRef.current);
    setScore(0);
    scoreRef.current = 0;
    setTimeLeft(GAME_TIME);
    setFallingItems([]);
    setStage('play');
  };

  const exitToHome = () => {
    clearInterval(timerRef.current);
    setFirstName(''); setLastName(''); setScore(0);
    scoreRef.current = 0;
    setTimeLeft(GAME_TIME); setFallingItems([]); setStage('intro');
  };

  const handleCatch = (id, isRare) => {
    setScore(prev => prev + (isRare ? 50 : 10));
    setLastSoulWord(SOUL_WORDS[Math.floor(Math.random() * SOUL_WORDS.length)]);
    setTimeout(() => setLastSoulWord(""), 800);
    setFallingItems(prev => prev.filter(item => item.id !== id));
    confetti({ particleCount: 20, spread: 70, origin: { y: 0.8 }, colors: ['#FDA4AF', '#FCD34D', '#fff'] });
  };

  const finishGame = () => {
    clearInterval(timerRef.current);
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    let currentLeaderboard = JSON.parse(localStorage.getItem('xmas-leaderboard-final') || '[]');
    const userIndex = currentLeaderboard.findIndex(u => u.name.toLowerCase() === fullName.toLowerCase());
    if (userIndex !== -1) {
      if (scoreRef.current > currentLeaderboard[userIndex].score) currentLeaderboard[userIndex].score = scoreRef.current;
    } else {
      currentLeaderboard.push({ name: fullName, score: scoreRef.current });
    }
    localStorage.setItem('xmas-leaderboard-final', JSON.stringify(currentLeaderboard));
    setLeaderboard(currentLeaderboard.sort((a, b) => b.score - a.score).slice(0, 10));
    setCurrentMessage(DIVINE_MESSAGES[Math.floor(Math.random() * DIVINE_MESSAGES.length)]);
    setStage('result-message');
    confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
  };

  useEffect(() => {
    if (stage === 'play') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) { finishGame(); return 0; }
          return prev - 1;
        });
      }, 1000);
      const spawner = setInterval(() => {
        const id = Math.random();
        const isRare = Math.random() > 0.85;
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        setFallingItems(prev => [...prev, { id, x: Math.random() * 85 + 5, isRare, color }]);
      }, 750);
      return () => { clearInterval(timerRef.current); clearInterval(spawner); };
    }
  }, [stage]);

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center font-sans text-white bg-[#02040a]">
      <div className="absolute inset-0 z-0 bg-cover bg-center opacity-20 scale-110" style={{ backgroundImage: `url(${BG_URL})` }} />
      
      {/* SNOW PARTICLES */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {snowParticles.map((p) => (
          <div key={p.id} className="absolute bg-white rounded-full animate-snow-fall"
            style={{ left: `${p.left}%`, width: `${p.size}px`, height: `${p.size}px`, opacity: p.opacity, filter: `blur(${p.blur})`, animationDuration: `${p.duration}s`, animationDelay: `${-p.delay}s`, top: '-20px' }}
          />
        ))}
      </div>

      {stage !== 'intro' && (
        <button onClick={exitToHome} className="fixed top-8 right-8 z-50 p-3 bg-white/5 hover:bg-white/10 backdrop-blur-3xl rounded-full border border-white/10 transition-all active:scale-90">
          <X size={20} />
        </button>
      )}

      <AnimatePresence mode="wait">
        {stage === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            className="z-30 bg-white/[0.03] backdrop-blur-[40px] border border-white/10 p-12 rounded-[4rem] shadow-2xl text-center w-full max-w-lg mx-4">
            
            {/* ENHANCED HEARTBEAT ANIMATION */}
            <motion.div 
              animate={{ scale: [1, 1.15, 1, 1.15, 1], opacity: [0.8, 1, 0.8, 1, 0.8] }} 
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }} 
              className="mb-6 flex justify-center drop-shadow-[0_0_15px_rgba(251,113,133,0.4)]"
            >
              <Heart className="text-rose-400 fill-rose-500/20" size={54} />
            </motion.div>

            <h1 className="text-5xl font-light mb-4 tracking-tighter italic">
              Heavenly <span className="font-black text-rose-500 not-italic">Gifts</span>
            </h1>
            <p className="text-white/40 mb-10 tracking-[0.3em] uppercase text-[10px] font-bold">Catch the blessings you deserve</p>
            <form onSubmit={(e) => { e.preventDefault(); if(firstName && lastName) setStage('play'); }} className="space-y-4">
              <input required value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Your First Name"
                className="w-full bg-white/5 rounded-3xl py-4 px-8 outline-none focus:ring-1 ring-rose-500/50 transition-all text-center placeholder:text-white/10 text-lg" />
              <input required value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Your Last Name"
                className="w-full bg-white/5 rounded-3xl py-4 px-8 outline-none focus:ring-1 ring-rose-500/50 transition-all text-center placeholder:text-white/10 text-lg" />
              <button className="w-full bg-white text-black hover:bg-rose-500 hover:text-white py-5 rounded-3xl font-black transition-all uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95">
                Start Your Journey
              </button>
            </form>
          </motion.div>
        )}

        {stage === 'play' && (
          <div className="fixed inset-0 z-40">
            <div className="absolute top-12 inset-x-0 flex flex-col items-center gap-2">
                <AnimatePresence>
                  {lastSoulWord && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: -40, opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-rose-400 font-serif italic text-3xl font-bold drop-shadow-lg">
                      {lastSoulWord}
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex gap-4">
                    <div className="bg-white/5 backdrop-blur-2xl px-6 py-2 rounded-2xl border border-white/10 flex items-center gap-3">
                        <Heart size={16} className="text-rose-400 fill-rose-400" /> <span className="text-xl font-bold tabular-nums">{score}</span>
                    </div>
                    <div className="bg-white/5 backdrop-blur-2xl px-6 py-2 rounded-2xl border border-white/10 flex items-center gap-3">
                        <Wind size={16} className="text-cyan-400" /> <span className="text-xl font-bold tabular-nums">{timeLeft}s</span>
                    </div>
                </div>
            </div>

            {fallingItems.map(item => (
              <motion.div key={item.id} initial={{ y: -100, x: `${item.x}vw` }} animate={{ y: '110vh', rotate: item.isRare ? 720 : 360 }}
                transition={{ duration: item.isRare ? 3.5 : 5.5, ease: "linear" }} onPointerDown={() => handleCatch(item.id, item.isRare)}
                className="absolute cursor-pointer touch-none p-4">
                <div className={`relative ${item.isRare ? 'scale-150' : 'scale-110'}`}>
                    <Gift size={48} className={`${item.color} drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] relative z-10`} />
                    <div className="absolute inset-0 overflow-hidden opacity-30 z-20">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full animate-shine-slow" />
                    </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {stage === 'result-message' && (
          <motion.div key="msg" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="z-30 bg-white text-slate-900 p-12 rounded-[3.5rem] shadow-2xl text-center max-w-lg mx-4">
            <p className="text-2xl font-serif italic mb-10 leading-[1.6] text-slate-800">
              {firstName}, {currentMessage}
            </p>
            <div className="space-y-4">
                <button onClick={() => setStage('leaderboard')} className="w-full bg-slate-950 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg">
                    Our Wall of Souls <ChevronRight size={18}/>
                </button>
                <button onClick={exitToHome} className="w-full text-slate-400 font-bold text-xs tracking-widest uppercase py-2 hover:text-rose-500 transition-colors">
                    Back to Silence
                </button>
            </div>
          </motion.div>
        )}

        {stage === 'leaderboard' && (
          <motion.div key="lead" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="z-30 bg-white p-12 rounded-[4rem] shadow-2xl w-full max-w-md mx-4 text-slate-800">
            <h2 className="text-2xl font-light mb-8 tracking-tighter text-center">Wall of <span className="font-black text-rose-500">Love</span></h2>
            <div className="space-y-3 mb-10 max-h-[350px] overflow-y-auto pr-2 custom-scroll">
                {leaderboard.map((u, i) => (
                    <div key={i} className={`flex items-center justify-between p-4 rounded-3xl transition-all ${u.name.toLowerCase() === `${firstName} ${lastName}`.toLowerCase() ? 'bg-rose-50' : 'bg-slate-50'}`}>
                        <span className="font-bold text-sm capitalize text-slate-700">{u.name}</span>
                        <span className="font-mono font-black text-lg">{u.score}</span>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <button onClick={startNewSession} className="bg-rose-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">
                    Seek More
                </button>
                <button onClick={exitToHome} className="bg-slate-100 text-slate-500 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">
                    Exit
                </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes snow-fall {
          0% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(25vh) translateX(15px); }
          50% { transform: translateY(50vh) translateX(-15px); }
          75% { transform: translateY(75vh) translateX(15px); }
          100% { transform: translateY(110vh) translateX(0); }
        }
        .animate-snow-fall { animation-name: snow-fall; animation-timing-function: linear; animation-iteration-count: infinite; }
        @keyframes shine-slow { 
          0% { transform: translateX(-100%) rotate(45deg); } 
          20% { transform: translateX(200%) rotate(45deg); } 
          100% { transform: translateX(200%) rotate(45deg); } 
        }
        .animate-shine-slow { animation: shine-slow 5s infinite; }
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #f43f5e33; border-radius: 10px; }
      `}</style>
    </div>
  );
}