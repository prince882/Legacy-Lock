
import { motion } from "framer-motion";
import React from "react";

export default function NeonButton({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.05, boxShadow: "0 0 8px #00ffff, 0 0 16px #00ffff" }}
      whileTap={{ scale: 0.95 }}
      className="px-4 py-2 mx-2 rounded-lg text-white bg-gray-900 border border-cyan-400 text-md font-semibold transition-colors duration-300"
    >
      {children}
    </motion.button>
  );
}
