"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Clock, Heart, Wind, X, Gift } from "lucide-react";
import confetti from "canvas-confetti";

// Firebase Imports
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  setDoc,
  doc,
  where,
  addDoc,
  getDoc,
  serverTimestamp,
  getDocs,
  startAfter,
} from "firebase/firestore";
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

const BG_URL =
  "https://images.unsplash.com/photo-1543589077-47d816067f73?q=80&w=2070&auto=format&fit=crop";
const ITEM_TYPES = [
  "gift",
  "cookie",
  "candy",
  "cap",
  "snow",
  "star",
  "bell",
  "tree",
  "icecream",
  "cake",
  "pizza",
  "coffee",
  "heart",
  "sparkle",
  "moon",
];
const REACTION_EMOJIS = ["😊", "😇", "🙂", "🥰", "😁", "🧒", "🎅", "🤶", "👼"];
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
  const [lastVisible, setLastVisible] = useState(null);
  const [userScoreData, setUserScoreData] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastEmoji, setLastEmoji] = useState("");
  const [totalPlayers, setTotalPlayers] = useState(0);
  const timerRef = useRef(null);
  const spawnerRef = useRef(null);
  const scoreRef = useRef(0);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    // Add a 'where' clause to only count players who actually have a score
    const q = query(
      collection(db, "leaderboard"),
      where("score", ">", 0) // Only count players with more than 0 points
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // This will now only count documents that pass the score filter
      setTotalPlayers(snapshot.size);
    });

    return () => unsubscribe();
  }, []);
  // 1. Fetch Top 10 + Listen for User's specific score
  useEffect(() => {
    // Listen to Top 10
    const q = query(
      collection(db, "leaderboard"),
      orderBy("score", "desc"),
      limit(10)
    );
    const unsubTop = onSnapshot(q, (snapshot) => {
      const scores = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLeaderboard(scores);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]); // Save last doc for pagination
    });

    // Listen to CURRENT USER specifically (prevents "NA" issue)
    if (firstName && lastName) {
      const userDocId = `${firstName.trim()} ${lastName.trim()}`
        .toLowerCase()
        .replace(/\s+/g, "-");
      const unsubUser = onSnapshot(doc(db, "leaderboard", userDocId), (doc) => {
        if (doc.exists()) {
          setUserScoreData(doc.data());
        }
      });
      return () => {
        unsubTop();
        unsubUser();
      };
    }

    return () => unsubTop();
  }, [firstName, lastName]);

  const fetchMoreScores = async () => {
    if (!lastVisible || loadingMore) return;
    setLoadingMore(true);

    try {
      const nextQ = query(
        collection(db, "leaderboard"),
        orderBy("score", "desc"),
        startAfter(lastVisible), // Now defined via imports
        limit(10)
      );

      const snapshot = await getDocs(nextQ);
      if (!snapshot.empty) {
        const nextScores = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLeaderboard((prev) => [...prev, ...nextScores]);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      }
    } catch (error) {
      console.error("Error fetching more:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const finishGame = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (spawnerRef.current) clearInterval(spawnerRef.current);

    const finalScore = scoreRef.current;
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const userDocId = fullName.toLowerCase().replace(/\s+/g, "-");

    setCurrentMessage(
      DIVINE_MESSAGES[Math.floor(Math.random() * DIVINE_MESSAGES.length)]
    );
    setStage("result-message");
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

    try {
      // To store RANK, we first see where this score sits in the global list
      const q = query(collection(db, "leaderboard"), orderBy("score", "desc"));
      const snapshot = await getDocs(q);
      const allScores = snapshot.docs.map((d) => d.data().score);

      // Calculate Rank: find how many people scored higher than current score + 1
      const currentRank = allScores.filter((s) => s > finalScore).length + 1;

      const userRef = doc(db, "leaderboard", userDocId);
      await setDoc(
        userRef,
        {
          name: fullName,
          score: finalScore,
          rank: currentRank, // Now storing rank in DB
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (e) {
      console.error("Firebase Update Error:", e);
    }
  }, [firstName, lastName]);

// 1. TIMER EFFECT (Stays simple)
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
    return () => clearInterval(timerRef.current);
  }
}, [stage, finishGame]);

// 2. SPAWNER EFFECT (Listens to timeLeft to increase speed)
useEffect(() => {
  if (stage === "play") {
    // Dynamically calculate rate and speed based on current timeLeft
    const spawnRate = timeLeft < 20 ? 450 : 700;
    const speed = timeLeft < 20 ? 1.8 : 1.2; // Notice the boost here

    spawnerRef.current = setInterval(() => {
      setFallingItems((prev) => [
        ...prev,
        {
          id: Math.random(),
          x: Math.random() * 85 + 5,
          isRare: Math.random() > 0.9,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          type: ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)],
          speedMultiplier: speed, 
        },
      ]);
    }, spawnRate);

    return () => clearInterval(spawnerRef.current);
  }
}, [stage, timeLeft < 20]); // Only restarts the interval when the "20 second" threshold is crossed
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
    setLastEmoji(
      REACTION_EMOJIS[Math.floor(Math.random() * REACTION_EMOJIS.length)]
    );
    setTimeout(() => setLastEmoji(""), 600);
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
              Heavenly{" "}
              <span className="font-bold text-rose-500 not-italic">Gifts</span>
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
      ${
        !firstName.trim() || !lastName.trim()
          ? "bg-white/10 text-white/20 cursor-not-allowed"
          : "bg-white text-black hover:bg-rose-500 hover:text-white shadow-xl"
      }`}
              >
                {/* Shaking Gift Box Icon */}
                <motion.div
                  animate={
                    firstName.trim() && lastName.trim()
                      ? {
                          rotate: [0, -10, 10, -10, 10, 0],
                          scale: [1, 1.1, 1],
                        }
                      : {}
                  }
                  transition={{
                    repeat: Infinity,
                    duration: 0.5,
                    repeatDelay: 1,
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
                  {lastEmoji && (
                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: -20, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute text-rose-400 font-serif italic text-3xl font-bold drop-shadow-lg"
                    >
                      {lastEmoji}
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
                  <span className="text-2xl font-bold font-mono">
                    {timeLeft}s
                  </span>
                </div>
              </div>
            </div>

            {fallingItems.map((item) => (
              <GiftItem key={item.id} item={item} onCatch={handleCatch} />
            ))}
          </motion.div>
        )}

        {stage === "result-message" && (
          <GiftRevealSequence
            key="reveal"
            firstName={firstName}
            score={score}
            message={currentMessage}
            onViewLeaderboard={() => setStage("leaderboard")}
            onExit={startNewSession}
          />
        )}

        {stage === "leaderboard" && (
          <LeaderboardScreen
            key="leaderboard"
            leaderboard={leaderboard}
            currentUser={`${firstName} ${lastName}`}
            onSeekMore={startNewSession}
            onExit={exitToHome}
            onBack={() => setStage("result-message")}
            userScoreData={userScoreData}
            fetchMore={fetchMoreScores}
            totalPlayers={totalPlayers}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
