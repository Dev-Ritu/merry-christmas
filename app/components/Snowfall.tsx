"use client";
import React, { useState, useEffect } from 'react';

interface Snowflake {
  id: number;
  left: number;
  duration: number;
  delay: number;
  size: number;
  opacity: number;
  blur: string;
}

export default function Snowfall() {
  const [particles, setParticles] = useState<Snowflake[]>([]);

  useEffect(() => {
    // Generate particles ONLY once we are on the client
    const generated = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: 5 + Math.random() * 10,
      delay: Math.random() * 10,
      size: 2 + Math.random() * 6,
      opacity: 0.1 + Math.random() * 0.5,
      blur: Math.random() > 0.8 ? '4px' : '0px'
    }));
    setParticles(generated);
  }, []);

  // If particles array is empty, we haven't mounted on client yet
  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute bg-white rounded-full animate-snow-fall"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            filter: `blur(${p.blur})`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${-p.delay}s`,
            top: '-20px'
          }}
        />
      ))}
      <style jsx global>{`
        @keyframes snow-fall {
          0% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(25vh) translateX(15px); }
          50% { transform: translateY(50vh) translateX(-15px); }
          75% { transform: translateY(75vh) translateX(15px); }
          100% { transform: translateY(110vh) translateX(0); }
        }
        .animate-snow-fall {
          animation-name: snow-fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  );
}