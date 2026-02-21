import { motion } from "framer-motion";

// Background image URL for Parkinson's disease awareness
const BACKGROUND_IMAGE_URL = "https://t4.ftcdn.net/jpg/08/38/45/51/360_F_838455130_ef0v3yGUwaOw2VeCFuXt4eg7tvN302hE.jpg";

export default function BackgroundAnimation() {
  return (
    <>
      {/* Global Background Image - Fixed, Cover, No Repeat */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${BACKGROUND_IMAGE_URL})`,
          backgroundAttachment: "fixed",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Blur Effect for Background */}
      <div
        className="fixed inset-0 z-0 backdrop-blur-[2px]"
        style={{
          backgroundImage: `url(${BACKGROUND_IMAGE_URL})`,
          backgroundAttachment: "fixed",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Dark Overlay for Readability - 50% opacity black */}
      <div
        className="fixed inset-0 z-0 bg-black/50"
      />

      {/* Subtle Animated Gradient Overlay for Depth Effect */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Top gradient for subtle lighting */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-black/30 to-transparent" />
        
        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/40 to-transparent" />
        
        {/* Center subtle glow */}
        <motion.div
          animate={{
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]"
        />

        {/* Subtle animated particles for depth */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white/20 rounded-full"
            style={{
              left: `${15 + i * 12}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 6 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>
    </>
  );
}
