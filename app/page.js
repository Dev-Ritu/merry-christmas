"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Clock, Heart, Wind, X, Gift } from "lucide-react";
import confetti from "canvas-confetti";

// Firebase Imports
import { collection, query, orderBy, limit, onSnapshot, setDoc, doc, addDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./lib/firebase";

// Modular Imports
import Snowfall from "./components/Snowfall";
import GiftItem from "./components/GiftItem";
import {
  GAME_TIME,
  SOUL_WORDS,
  COLORS,
  DIVINE_MESSAGES,
} from "./constants/gameData";
import LeaderboardScreen from "./components/LeaderboardScreen";
import GiftRevealSequence from "./components/GiftRevealSequence";

const BG_URL = "https://images.unsplash.com/photo-1543589077-47d816067f73?q=80&w=2070&auto=format&fit=crop";
const ITEM_TYPES = [
  'gift', 'cookie', 'candy', 'cap', 'snow', 
  'star', 'bell', 'tree', 'icecream', 'cake', 
  'pizza', 'coffee', 'heart', 'sparkle', 'moon'
];
export default function ChristmasSpiritApp() {
  const [stage, setStage] = useState("intro");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [fallingItems, setFallingItems] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [lastSoulWord, setLastSoulWord] = useState("");

  const timerRef = useRef(null);
  const spawnerRef = useRef(null);
  const scoreRef = useRef(0);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  // REAL-TIME GLOBAL LEADERBOARD
  useEffect(() => {
    const q = query(
      collection(db, "leaderboard"),
      orderBy("score", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const scores = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLeaderboard(scores);
    });

    return () => unsubscribe();
  }, []);

  const finishGame = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (spawnerRef.current) clearInterval(spawnerRef.current);

    const finalScore = scoreRef.current;
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const userDocId = fullName.toLowerCase().replace(/\s+/g, '-');

    // UI Transition
    setCurrentMessage(DIVINE_MESSAGES[Math.floor(Math.random() * DIVINE_MESSAGES.length)]);
    setStage("result-message");
    confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });

    // Firebase: UNIQUE USER UPDATE (Only update if score is higher)
   try {
  const userRef = doc(db, "leaderboard", userDocId);
  let userSnap;

  try {
    // Attempt to get from server/cache normally
    userSnap = await getDoc(userRef);
  } catch (e) {
    // If offline error occurs, specifically try to get from cache
    userSnap = await getDocFromCache(userRef);
  }

  if (!userSnap?.exists() || finalScore > userSnap.data().score) {
    await setDoc(userRef, {
      name: fullName,
      score: finalScore,
      updatedAt: serverTimestamp()
    }, { merge: true });
  }
} catch (e) {
  console.log("Saving locally, will sync when online.");
}
  }, [firstName, lastName]);


// const finishGame = useCallback(async () => {
//     // Clear all intervals immediately to prevent double-firing
//     if (timerRef.current) clearInterval(timerRef.current);
//     if (spawnerRef.current) clearInterval(spawnerRef.current);

//     const finalScore = scoreRef.current;
//     const fullName = `${firstName.trim()} ${lastName.trim()}`;

//     // 1. Move to result screen immediately for UI responsiveness
//     setCurrentMessage(DIVINE_MESSAGES[Math.floor(Math.random() * DIVINE_MESSAGES.length)]);
//     setStage("result-message");
//     confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
// const userDocId = fullName.toLowerCase().replace(/\s+/g, '-');
//     // 2. Save to Firebase (Global Real-time)
//     try {
//        const userRef = doc(db, "leaderboard", userDocId);
//       let userSnap;
//       console.log("userRef>>>>>>>",userRef)
//       userSnap = await getDoc(userRef);
//             console.log("getDoc>>>>>>>",userRef)

//       await addDoc(collection(db, "leaderboard"), {
//         name: fullName,
//         score: finalScore,
//         createdAt: serverTimestamp()
//       });
//     } catch (e) {
//       console.error("Firebase Error:", e);
//     }
//   }, [firstName, lastName]);

  useEffect(() => {
    if (stage === "play") {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            finishGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

     spawnerRef.current = setInterval(() => {
       setFallingItems((prev) => [
         ...prev,
         {
           id: Math.random(),
           x: Math.random() * 85 + 5,
           isRare: Math.random() > 0.9,
           color: COLORS[Math.floor(Math.random() * COLORS.length)],
           // Randomly pick one of the 15 items:
           type: ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)],
         },
       ]);
     }, 700);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (spawnerRef.current) clearInterval(spawnerRef.current);
      };
    }
  }, [stage, finishGame]);

  const startNewSession = () => {
    setScore(0);
    scoreRef.current = 0;
    setTimeLeft(GAME_TIME);
    setFallingItems([]);
    setStage("play");
  };

  const exitToHome = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (spawnerRef.current) clearInterval(spawnerRef.current);
    setFirstName("");
    setLastName("");
    setScore(0);
    scoreRef.current = 0;
    setTimeLeft(GAME_TIME);
    setFallingItems([]);
    setStage("intro");
  };

  const handleCatch = (id, isRare) => {
    setScore((prev) => prev + (isRare ? 50 : 10));
    setLastSoulWord(SOUL_WORDS[Math.floor(Math.random() * SOUL_WORDS.length)]);
    setTimeout(() => setLastSoulWord(""), 800);
    setFallingItems((prev) => prev.filter((i) => i.id !== id));
    confetti({ particleCount: 20, spread: 70, origin: { y: 0.8 } });
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center font-sans text-white bg-[#02040a]">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-20 scale-110"
        style={{ backgroundImage: `url(${BG_URL})` }}
      />

      <Snowfall />

      {stage !== "intro" && (
        <button
          onClick={exitToHome}
          className="fixed top-8 right-8 z-50 p-3 bg-white/5 hover:bg-white/10 backdrop-blur-3xl rounded-full border border-white/10 transition-colors"
        >
          <X size={20} />
        </button>
      )}

      <AnimatePresence mode="wait">
        {stage === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="z-30 bg-white/[0.03] backdrop-blur-[40px] border border-white/10 p-12 rounded-[4rem] shadow-2xl text-center w-full max-w-lg mx-4"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="mb-6 flex justify-center"
            >
              <Heart className="text-rose-400 fill-rose-500/20" size={54} />
            </motion.div>

            <h1 className="text-5xl font-light mb-8 tracking-tighter italic">
              Heavenly <span className="font-bold text-rose-500 not-italic">Gifts</span>
            </h1>

           <form
  onSubmit={(e) => {
    e.preventDefault();
    if (firstName.trim() && lastName.trim()) setStage("play");
  }}
  className="space-y-4"
>
  <input
    required
    value={firstName}
    onChange={(e) => setFirstName(e.target.value)}
    placeholder="First Name"
    className="w-full bg-white/5 rounded-3xl py-4 px-8 text-center outline-none border border-white/5 focus:border-rose-500/50 transition-all placeholder:text-white/30"
  />
  <input
    required
    value={lastName}
    onChange={(e) => setLastName(e.target.value)}
    placeholder="Last Name"
    className="w-full bg-white/5 rounded-3xl py-4 px-8 text-center outline-none border border-white/5 focus:border-rose-500/50 transition-all placeholder:text-white/30"
  />
  
  <button 
    type="submit" 
    disabled={!firstName.trim() || !lastName.trim()}
    className={`w-full py-5 rounded-3xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all active:scale-95 
      ${(!firstName.trim() || !lastName.trim()) 
        ? "bg-white/10 text-white/20 cursor-not-allowed" 
        : "bg-white text-black hover:bg-rose-500 hover:text-white shadow-xl"
      }`}
  >
    {/* Shaking Gift Box Icon */}
    <motion.div
      animate={firstName.trim() && lastName.trim() ? {
        rotate: [0, -10, 10, -10, 10, 0],
        scale: [1, 1.1, 1]
      } : {}}
      transition={{ 
        repeat: Infinity, 
        duration: 0.5, 
        repeatDelay: 1 
      }}
    >
      <Gift size={18} />
    </motion.div>
    
    COLLECT GIFTS
  </button>
</form> 

          </motion.div>
        )}

        {stage === "play" && (
          <motion.div 
            key="play-ui"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
          >
            {/* STICKED HUD CONTAINER */}
            <div className="absolute top-12 inset-x-0 h-32 flex flex-col items-center pointer-events-none">
              {/* Soul Word: Absolute positioned so it doesn't push the boxes */}
              <div className="h-12 relative w-full flex justify-center">
                <AnimatePresence>
                  {lastSoulWord && (
                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: -20, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute text-rose-400 font-serif italic text-3xl font-bold drop-shadow-lg"
                    >
                      {lastSoulWord}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Score and Time: Sticked in place */}
              <div className="flex gap-4 pointer-events-auto">
                <div className="bg-white/10 backdrop-blur-2xl px-6 py-2 rounded-2xl border border-white/20 flex items-center gap-3 w-32 justify-center">
                  <Heart size={18} className="text-rose-400 fill-rose-400" />
                  <span className="text-2xl font-bold font-mono">{score}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-2xl px-6 py-2 rounded-2xl border border-white/20 flex items-center gap-3 w-32 justify-center">
                  <Clock size={18} className="text-cyan-400" />
                  <span className="text-2xl font-bold font-mono">{timeLeft}s</span>
                </div>
              </div>
            </div>

            {fallingItems.map((item) => (
              <GiftItem key={item.id} item={item} onCatch={handleCatch} />
            ))}
          </motion.div>
        )}

        {stage === 'result-message' && (
          <GiftRevealSequence
            key="reveal"
            firstName={firstName}
            score={score}
            message={currentMessage}
            onViewLeaderboard={() => setStage('leaderboard')}
            onExit={exitToHome}
          />
        )}

        {stage === "leaderboard" && (
          <LeaderboardScreen
            key="leaderboard"
            leaderboard={leaderboard}
            currentUser={`${firstName} ${lastName}`}
            onSeekMore={startNewSession}
            onExit={exitToHome}
          />
        )}
      </AnimatePresence>
    </div>
  );
}