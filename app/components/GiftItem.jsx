"use client";
import { motion } from 'framer-motion';
import { Gift, Sparkles } from 'lucide-react';

export default function GiftItem({ item, onCatch }) {
  return (
    <motion.div 
      initial={{ y: -100, x: `${item.x}vw` }} 
      animate={{ y: '110vh', rotate: item.isRare ? 720 : 360 }}
      transition={{ duration: item.isRare ? 3.5 : 5.5, ease: "linear" }} 
      onPointerDown={() => onCatch(item.id, item.isRare)}
      className="absolute cursor-pointer touch-none p-4"
    >
      <div className={`relative ${item.isRare ? 'scale-150' : 'scale-110'}`}>
        <Gift size={48} className={`${item.color} drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] relative z-10`} />
        <div className="absolute inset-0 overflow-hidden opacity-30 z-20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full animate-shine-slow" />
        </div>
      </div>
    </motion.div>
  );
}