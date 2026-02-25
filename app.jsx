import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  // Smooth, glitch-free cursor tracking via CSS Variables
  useEffect(() => {
    let ticking = false;
    
    const updateCursor = (x: number, y: number) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          document.documentElement.style.setProperty('--cursor-x', `${x}px`);
          document.documentElement.style.setProperty('--cursor-y', `${y}px`);
          ticking = false;
        });
        ticking = true;
      }
    };

    const handleMouseMove = (e: MouseEvent) => updateCursor(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updateCursor(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    
    // Initial centering
    document.documentElement.style.setProperty('--cursor-x', `${window.innerWidth / 2}px`);
    document.documentElement.style.setProperty('--cursor-y', `${window.innerHeight / 2}px`);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchstart", handleTouchMove, { passive: true });
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchstart", handleTouchMove);
    };
  }, []);

  // Handle Stone Drop Ripple Effect on Click
  const handleWaterClick = (e: React.MouseEvent) => {
    const newRipple = { id: Date.now(), x: e.clientX, y: e.clientY };
    setRipples((prev) => [...prev, newRipple]);
    // Clean up ripples after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 2000);
  };

  const { scrollYProgress } = useScroll({ target: containerRef });
  
  // High fidelity spring physics to ensure premium scrolling without jank
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 1,
    restDelta: 0.001
  });
  
  // Total height is 700vh. The window is 100vh.
  // Content needs to move up by 600vh, which is 600% of the viewport height.
  // Because the container is 700vh, 100% of scroll is moving 600vh up.
  // In percentage terms of a fixed container matching window height, it translates down by -85.714% if relative to a 700vh div.
  // Since we animate a fixed div of 700vh height, we translate it from 0% to -85.714% (which is exactly -600vh).
  const yTranslate = useTransform(smoothProgress, [0, 1], ["0%", "-85.714%"]);

  return (
    <div ref={containerRef} className="h-[700vh] w-full bg-black relative">
      <SVGDefinitions />
      
      {/* 
        LAYER 0: MIST BACKGROUND
        The rapid, simple grey mist moving against the black void
      */}
      <div className="mist-layer" />

      {/* 
        LAYER 1: AMBIENT GUIDES (Unmasked)
        The simple, simple ambient nodes that pulse, showing the flow
      */}
      <AmbientGuides />

      {/* 
        LAYER 2: THE SPOTLIGHT LENS (Masked)
        The realistic flashlight masking the intensely colorful graffiti
      */}
      <div 
        className="spotlight-container" 
        onClick={handleWaterClick}
      >
        {/* 
          LAYER 3: THE GRAFFITI PAYLOAD
          The continuous synchronized scrollable content, hidden inside the mask
        */}
        <motion.div 
          className="w-full h-[700vh] absolute top-0 left-0 content-scroll-layer"
          style={{ y: yTranslate }}
        >
          <GraffitiConcertMarketing />
        </motion.div>

        {/* The tight water distortion SVG filter and glassmorphism applied over the graffiti */}
        <div className="water-lens-backdrop" />

        {/* 
          LAYER 4: GLASSMORPHIC RIPPLES
          Spawned on click
        */}
        <AnimatePresence>
          {ripples.map((r) => (
            <motion.div
              key={r.id}
              initial={{ scale: 0, opacity: 0.8, borderWidth: "10px" }}
              animate={{ scale: 8, opacity: 0, borderWidth: "1px" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="fixed rounded-full border-white/50 pointer-events-none z-50"
              style={{
                top: r.y - 50,
                left: r.x - 50,
                width: 100,
                height: 100,
                backdropFilter: 'blur(20px) contrast(1.5)',
                boxShadow: 'inset 0 0 40px rgba(255,255,255,0.4), 0 0 20px rgba(255,255,255,0.2)'
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// SVG DEFINITIONS
// Tightly calibrated for premium, minimal distortion
// ----------------------------------------------------------------------
function SVGDefinitions() {
  return (
    <svg width="0" height="0" className="fixed" style={{ pointerEvents: 'none', position: 'absolute' }}>
      <filter id="tight-water-ripple" x="-20%" y="-20%" width="140%" height="140%">
        {/* Higher frequency, smaller scale = tighter, glassier water */}
        <feTurbulence 
          type="fractalNoise" 
          baseFrequency="0.03 0.04" 
          numOctaves="2" 
          result="noise" 
        >
          <animate 
            attributeName="baseFrequency" 
            values="0.03 0.04; 0.035 0.045; 0.03 0.04" 
            dur="15s" 
            repeatCount="indefinite" 
          />
        </feTurbulence>
        <feDisplacementMap 
          in="SourceGraphic" 
          in2="noise" 
          scale="8" 
          xChannelSelector="R" 
          yChannelSelector="G" 
        />
      </filter>
    </svg>
  );
}

// ----------------------------------------------------------------------
// AMBIENT GUIDES
// The pitch black base layer with luxuriously twitching glows
// Connecting a continuous flow line
// ----------------------------------------------------------------------
function AmbientGuides() {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-[1] flex items-center justify-center overflow-hidden mix-blend-screen">
      {/* Exact percentage-based ambient routing mechanism */}
      <svg className="absolute top-0 left-0 w-full h-[700vh] opacity-[0.15]" viewBox="0 0 100 700" preserveAspectRatio="none">
        <path 
          d="M 50 50 L 20 150 L 80 250 L 30 400 L 70 550 L 20 650 L 50 680" 
          fill="none" 
          stroke="#ffffff" 
          strokeWidth="0.1" 
          className="ambient-path"
        />
      </svg>

      {/* Constellation Nodes matching the path points */}
      <PulseNode top="50vh" left="50vw" size={3} />
      <PulseNode top="150vh" left="20vw" size={4} />
      <PulseNode top="250vh" left="80vw" size={2} />
      <PulseNode top="400vh" left="30vw" size={5} />
      <PulseNode top="550vh" left="70vw" size={3} />
      <PulseNode top="650vh" left="20vw" size={4} />
      <PulseNode top="680vh" left="50vw" size={6} />

      {/* Pure, simplistic text on the outside directing the flow */}
      <div className="absolute top-[85vh] w-full text-center text-zinc-600 tracking-[0.5em] font-syne text-xs uppercase animate-pulse">
        Illuminate The Void
      </div>
    </div>
  );
}

function PulseNode({ top, left, size }: { top: string, left: string, size: number }) {
  return (
    <div 
      className="absolute z-10" 
      style={{
        top, 
        left, 
        width: `${size * 0.25}rem`, 
        height: `${size * 0.25}rem`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="w-full h-full rounded-full pulse-node" />
    </div>
  );
}

// ----------------------------------------------------------------------
// GRAFFITI CONCERT MARKETING
// LAX Street Graffiti style. Acid colors, Void backgrounds.
// ----------------------------------------------------------------------
function GraffitiConcertMarketing() {
  return (
    <div className="relative w-full h-full pointer-events-auto overflow-hidden">
      
      {/* 
        SECTION 1: THE INVASION (HERO) 
        Immediate high contrast neon drop on black.
      */}
      <section className="absolute top-[10vh] left-[10vw] w-[80vw] h-[80vh] flex flex-col items-center justify-center text-center">
        <h1 className="brutalist-block text-[15vw] text-void stroke-electric-blue relative z-10 scale-[1.2] rotate-[-2deg] hover:scale-[1.25] transition-transform duration-700">
          VOID PARADOX
        </h1>
        <div className="graffiti-text text-[10vw] absolute top-[50%] left-[20%] z-20 mix-blend-hard-light rotate-[-12deg] pointer-events-none">
          Live in LA
        </div>
        <div className="glass-panel-heavy mt-[5vh] p-6 z-30 skew-x-12 transform hover:skew-x-0 transition-transform duration-500">
          <p className="font-syne text-xl text-white tracking-[0.3em] uppercase font-bold">
            October 31st / The Underground Reservoir
          </p>
        </div>
        
        {/* Chaotic Acid Splatter */}
        <div className="absolute top-[20%] left-[60%] w-[30vw] h-[30vw] bg-[radial-gradient(circle,var(--color-acid-yellow)_0%,transparent_60%)] mix-blend-screen opacity-50 blur-[40px] z-0" />
      </section>

      {/* 
        SECTION 2: RAW AESTHETIC
      */}
      <section className="absolute top-[130vh] left-[5vw] w-[60vw]">
        <h2 className="brutalist-block text-[12vw] text-white leading-none relative z-10 shadow-[20px_20px_0px_var(--color-street-orange)] hover:shadow-[-20px_20px_0px_var(--color-hyper-pink)] transition-shadow duration-700">
          SHATTER
          <br />
          THE GRID
        </h2>
        <div className="mt-[-8vh] ml-[15vw] z-20 relative font-rock text-[4vw] text-hyper-pink rotate-[-5deg] bg-void/80 p-4 inline-block border-2 border-hyper-pink">
          No VIP. No Rules.
        </div>
        <p className="font-syne mt-12 text-2xl max-w-2xl text-white/80 font-bold tracking-wider glass-panel p-8 rounded-lg border-l-4 border-l-acid-yellow">
          We strip away the polished veneer. This is raw audio architecture injected straight into the concrete veins of Los Angeles. 
        </p>
        
        <div className="absolute top-[10%] left-[-20%] w-[50vw] h-[50vw] bg-[radial-gradient(circle,var(--color-hyper-pink)_0%,transparent_70%)] mix-blend-color-dodge opacity-40 blur-[80px] z-[-1]" />
      </section>

      {/* 
        SECTION 3: THE LINEUP / GLITCH
      */}
      <section className="absolute top-[260vh] right-[5vw] w-[70vw] flex flex-col items-end text-right">
        <h2 className="glitch-layer text-[18vw] leading-none text-white opacity-80 z-0 absolute top-[-10vh] left-[-10vw]">
          LINEUP
        </h2>
        
        <div className="relative z-10 glass-panel-heavy p-12 border-r-4 border-r-electric-blue border-l-0 w-3/4 transform -rotate-2">
          <h3 className="graffiti-text text-[6vw] text-electric-blue drop-shadow-[0_0_15px_rgba(0,240,255,0.8)]">
            NEON TEARS
          </h3>
          <h3 className="brutalist-block text-[5vw] text-white mt-4 tracking-tight stroke-hyper-pink">
            ACID BAPTISM
          </h3>
          <h3 className="font-rock text-[3vw] text-acid-yellow mt-4 opacity-90">
            + THE SILENT ECHOES
          </h3>
        </div>
      </section>

      {/* 
        SECTION 4: TICKETS / OVERLOAD
      */}
      <section className="absolute top-[380vh] left-[15vw] w-[70vw] flex flex-col items-center justify-center">
        <div className="relative w-full aspect-video border-[2px] border-acid-yellow bg-black/60 backdrop-blur-3xl overflow-hidden flex items-center justify-center group shadow-[0_0_100px_rgba(204,255,0,0.3)] hover:shadow-[0_0_150px_rgba(255,0,85,0.6)] transition-all duration-700">
          <div className="absolute inset-0 opacity-40 group-hover:opacity-80 transition-opacity duration-1000"
            style={{ 
              backgroundImage: 'repeating-linear-gradient(45deg, var(--color-street-orange) 0, var(--color-street-orange) 1px, transparent 1px, transparent 10px)',
              backgroundSize: '20px 20px'
            }}
          />
          <h2 className="brutalist-block text-[10vw] text-white mix-blend-exclusion z-10 text-center scale-150 group-hover:scale-100 transition-transform duration-1000 ease-in-out">
            ACCESS
            <br />
            GRANTED
          </h2>
        </div>
        <div className="mt-[-4vh] z-20 font-syne font-black text-[3vw] text-void bg-acid-yellow px-12 py-6 rotate-3 hover:rotate-[-3deg] hover:bg-white transition-all duration-300 cursor-pointer shadow-xl">
          SECURE ENTRY CODES
        </div>
      </section>

      {/* 
        SECTION 5: THE ABYSS (FOOTER)
      */}
      <section className="absolute top-[550vh] left-[5vw] w-[90vw] h-[100vh] flex flex-col items-center justify-center text-center">
        <h2 className="font-sedgwick text-[8vw] text-white/50 z-0 absolute top-[20%]">
          Don't lose your way...
        </h2>
        <h2 className="brutalist-block text-[12vw] tracking-tighter text-transparent stroke-electric-blue leading-none z-10 hover:stroke-hyper-pink transition-colors duration-1000">
          THE END IS
          <br />
          JUST NOISE
        </h2>
        
        <div className="mt-20 font-marker text-2xl text-street-orange z-10 mix-blend-screen p-8 border border-white/10 glass-panel">
          VOID PARADOX 2025 // LOS ANGELES
        </div>

        {/* Scattered glowing orbs */}
        <div className="absolute top-[50%] left-[20%] w-[10vw] h-[10vw] rounded-full bg-electric-blue/40 blur-[50px] animate-pulse" />
        <div className="absolute top-[30%] right-[20%] w-[15vw] h-[15vw] rounded-full bg-hyper-pink/40 blur-[60px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-[20%] left-[50%] w-[8vw] h-[8vw] rounded-full bg-acid-yellow/40 blur-[40px] animate-pulse" style={{ animationDelay: '2s' }} />
      </section>

    </div>
  );
}
