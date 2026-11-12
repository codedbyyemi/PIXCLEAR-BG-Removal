import { useState } from 'react';
import { motion } from 'framer-motion';
import { MoveHorizontal } from 'lucide-react';

export default function ComparisonSlider({ before, after, beforeLabel = 'ORIGINAL', afterLabel = 'BACKGROUND REMOVED', className = '', id }) {
  const [position, setPosition] = useState(50);
  return (
    <div id={id} className={`comparison-frame ${className}`}>
      <motion.img key={after} className="comparison-after" src={after} alt={afterLabel.toLowerCase()} draggable="false" initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.32, ease: 'easeOut' }} />
      <motion.div className="comparison-before-clip" animate={{ clipPath: `inset(0 ${100 - position}% 0 0)` }} transition={{ duration: 0.12, ease: 'easeOut' }}>
        <img className="comparison-before" src={before} alt={beforeLabel.toLowerCase()} draggable="false" />
      </motion.div>
      <motion.div className="comparison-divider" animate={{ left: `${position}%` }} transition={{ type: 'spring', stiffness: 430, damping: 42, mass: 0.45 }} aria-hidden="true">
        <motion.span whileHover={{ scale: 1.08 }}><MoveHorizontal size={18} /></motion.span>
      </motion.div>
      <div className="comparison-label comparison-label-before">{beforeLabel}</div>
      <div className="comparison-label comparison-label-after">{afterLabel}</div>
      <input
        className="comparison-range"
        type="range"
        min="0"
        max="100"
        value={position}
        aria-label="Move the comparison slider to compare the original and background-removed image"
        onChange={(event) => setPosition(Number(event.target.value))}
      />
    </div>
  );
}
