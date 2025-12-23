"use client";
import { motion } from "framer-motion";
import { useRef, useEffect } from "react";
import {
  Gift,
  Cookie,
  Candy,
  PartyPopper,
  Snowflake,
  Star,
  Bell,
  TreePine,
  IceCream,
  Cake,
  Pizza,
  Coffee,
  Heart,
  Sparkles,
  Moon,
} from "lucide-react";

const ICON_MAP = {
  gift: Gift,
  cookie: Cookie,
  candy: Candy,
  cap: PartyPopper,
  snow: Snowflake,
  star: Star,
  bell: Bell,
  tree: TreePine,
  icecream: IceCream,
  cake: Cake,
  pizza: Pizza,
  coffee: Coffee,
  heart: Heart,
  sparkle: Sparkles,
  moon: Moon,
};

export default function GiftItem({ item, onCatch }) {
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio("/sounds/tap.mp3"); // Ensure this exists in public/sounds/
    audioRef.current.volume = 0.3;
  }, []);

  const handleCapture = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
    onCatch(item.id, item.isRare);
  };

  const IconComponent = ICON_MAP[item.type] || Gift;

  // DYNAMIC SPEED: Duration decreases as speedMultiplier increases
  const baseDuration = item.isRare ? 3 : 5;
  const finalDuration = baseDuration / (item.speedMultiplier || 1);

  return (
    <motion.div
      initial={{ y: -100, x: `${item.x}vw` }}
      animate={{ y: "110vh", rotate: item.isRare ? 720 : 360 }}
      transition={{ duration: finalDuration, ease: "linear" }}
      onPointerDown={handleCapture}
      className="absolute cursor-pointer touch-none p-4 z-40"
    >
      <motion.div whileTap={{ scale: 0.6 }} className="relative">
        <IconComponent
          size={item.isRare ? 52 : 44}
          className={`${item.color} drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]`}
        />
        {item.isRare && (
          <div className="absolute inset-0 bg-white/20 blur-xl rounded-full -z-10 animate-pulse" />
        )}
      </motion.div>
    </motion.div>
  );
}
