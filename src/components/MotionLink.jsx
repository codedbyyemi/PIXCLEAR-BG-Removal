import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';

const AnimatedRouterLink = motion.create(Link);
const ctaClasses = /\b(button-primary|button-outline|quick-action|download-button|price-button|text-cta)\b/;

const MotionLink = forwardRef(function MotionLink(
  { whileHover, whileTap, transition, className = '', ...props },
  ref,
) {
  const prefersReducedMotion = useReducedMotion();
  const isCta = ctaClasses.test(className);
  const defaultHover = isCta
    ? { y: -2, scale: 1.015, boxShadow: '0 10px 22px rgba(104, 65, 232, 0.18)' }
    : { y: -1, scale: 1.012 };

  return (
    <AnimatedRouterLink
      ref={ref}
      className={className}
      whileHover={prefersReducedMotion ? undefined : (whileHover ?? defaultHover)}
      whileTap={prefersReducedMotion ? undefined : (whileTap ?? { scale: 0.98 })}
      transition={transition ?? { type: 'spring', stiffness: 440, damping: 31, mass: 0.5 }}
      {...props}
    />
  );
});

export default MotionLink;
