import MotionLink from '../components/MotionLink';
import { motion } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';

export default function Success() {
  return (
    <main className="success-page">
      <header className="success-header"><MotionLink to="/editor" className="editor-back" aria-label="Back to editor"><ArrowLeft size={26} /></MotionLink><BrandLogo size="small" /><MotionLink to="/dashboard" className="success-avatar" aria-label="Open dashboard"><img src="/images/ashley-avatar.webp" alt="" /></MotionLink></header>
      <motion.section className="success-content" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.42, ease: 'easeOut' }}>
        <motion.div className="success-check" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.12, type: 'spring', stiffness: 190, damping: 14 }}><Check size={98} strokeWidth={2.4} /></motion.div>
        <h1>Image <em>Successfully</em><br /> Downloaded</h1>
        <p>Your transparent PNG is ready. The image was saved directly from this browser.</p>
        <div className="success-actions"><MotionLink to="/" className="button button-primary success-home">Back to Home</MotionLink><MotionLink to="/dashboard" className="text-cta">Process another image <span>→</span></MotionLink></div>
      </motion.section>
      <div className="success-decor" aria-hidden="true"><span /><span /></div>
    </main>
  );
}
