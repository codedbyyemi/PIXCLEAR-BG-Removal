import { forwardRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const ctaClasses = /\b(button-primary|button-outline|quick-action|download-button|auth-submit|dropzone-button|price-button)\b/;

const MotionButton = forwardRef(function MotionButton(
  { whileHover, whileTap, transition, disabled, className = '', ...props },
  ref,
) {
  const prefersReducedMotion = useReducedMotion();
  const interactive = !disabled && !prefersReducedMotion;
  const isCta = ctaClasses.test(className);
  const defaultHover = isCta
    ? { y: -2, scale: 1.018, boxShadow: '0 11px 24px rgba(104, 65, 232, 0.2)' }
    : { y: -1, scale: 1.028 };
  const defaultTap = isCta ? { y: 0, scale: 0.975 } : { y: 0, scale: 0.955 };

  return (
    <motion.button
      ref={ref}
      className={className}
      disabled={disabled}
      whileHover={interactive ? (whileHover ?? defaultHover) : undefined}
      whileTap={interactive ? (whileTap ?? defaultTap) : undefined}
      transition={transition ?? { type: 'spring', stiffness: 440, damping: 29, mass: 0.48 }}
      {...props}
    />
  );
});

export default MotionButton;
