import { useEffect, useState } from 'react';
import MotionLink from '../components/MotionLink';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import MotionButton from '../components/MotionButton';
import { ArrowRight, Check, ChevronDown, ImagePlus, Menu, ShieldCheck, Sparkles, UploadCloud, WandSparkles, X } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import Dropzone from '../components/Dropzone';

const fadeUp = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } };
const titleParts = [
  { text: 'Remove', emphasis: false },
  { text: 'Image Background', emphasis: true },
  { text: 'In Seconds!', emphasis: false },
];
const titleText = titleParts.map((part) => part.text).join(' ');
const titleLetterCount = Array.from(titleText.replace(/\s/g, '')).length;

function TypewriterHeading({ reduceMotion }) {
  const [visibleLetterCount, setVisibleLetterCount] = useState(reduceMotion ? titleLetterCount : 0);
  let letterIndex = 0;
  let wordIndex = 0;
  const wordCount = titleParts.reduce((total, part) => total + part.text.split(' ').length, 0);

  useEffect(() => {
    if (reduceMotion) {
      setVisibleLetterCount(titleLetterCount);
      return undefined;
    }

    setVisibleLetterCount(0);
    let currentLetter = 0;
    const timer = window.setInterval(() => {
      currentLetter += 1;
      setVisibleLetterCount(currentLetter);
      if (currentLetter >= titleLetterCount) window.clearInterval(timer);
    }, 42);

    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  return (
    <h1 aria-label={titleText}>
      <span className="typewriter-visual" aria-hidden="true">
        {titleParts.map((part, partIndex) => {
          const words = part.text.split(' ').map((word) => {
            const thisWord = wordIndex++;
            const letters = Array.from(word).map((letter) => {
              const thisLetter = letterIndex++;
              return (
                <motion.span
                  className="typewriter-letter"
                  key={`${partIndex}-${thisLetter}`}
                  initial={reduceMotion ? false : 'waiting'}
                  animate={thisLetter < visibleLetterCount ? 'typed' : 'waiting'}
                  variants={{ waiting: { opacity: 0, y: 9 }, typed: { opacity: 1, y: 0 } }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.16, ease: 'easeOut' }}
                >
                  {letter}
                </motion.span>
              );
            });
            return <span className={`typewriter-word ${thisWord < wordCount - 1 ? 'has-space' : ''}`} key={`${partIndex}-word-${thisWord}`}>{letters}</span>;
          });

          return part.emphasis ? <em key={`part-${partIndex}`}>{words}</em> : <span key={`part-${partIndex}`}>{words}</span>;
        })}
      </span>
      {!reduceMotion && visibleLetterCount === titleLetterCount && <motion.span className="typewriter-caret" aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.6, ease: 'easeInOut' }} />}
    </h1>
  );
}

function InView({ children, className = '', delay = 0, id }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.section id={id} className={className} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.18 }} transition={{ duration: reduceMotion ? 0 : 0.55, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.section>
  );
}

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const navItems = [
    ['Features', '#features'],
    ['How It Works', '#how-it-works'],
    ['Pricing', '#pricing'],
  ];
  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="landing-page">
      <header className="site-header">
        <div className="header-inner">
          <BrandLogo />
          <nav className="desktop-nav" aria-label="Main navigation">
            {navItems.map(([label, target]) => <motion.a key={label} href={target} className="nav-link" whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 440, damping: 30 }}>{label}</motion.a>)}
          </nav>
          <div className="header-actions">
            <MotionLink className="button button-outline header-login" to="/login">Log In</MotionLink>
            <MotionLink className="button button-primary header-start" to="/signup">Get Started</MotionLink>
          </div>
          <MotionButton className="icon-button mobile-menu-toggle" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </MotionButton>
        </div>
        <AnimatePresence>
          {menuOpen && <motion.nav className="mobile-nav" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }} aria-label="Mobile navigation">
            {navItems.map(([label, target]) => <motion.a key={label} href={target} onClick={closeMenu} whileHover={{ x: 3 }} whileTap={{ scale: 0.985 }} transition={{ type: 'spring', stiffness: 440, damping: 30 }}>{label}<ChevronDown size={15} /></motion.a>)}
            <MotionLink to="/login" onClick={closeMenu}>Log In</MotionLink>
            <MotionLink to="/signup" onClick={closeMenu}>Get Started</MotionLink>
          </motion.nav>}
        </AnimatePresence>
      </header>

      <motion.div className="decor decor-butterfly" aria-hidden="true" animate={reduceMotion ? undefined : { y: [0, -8, 0], rotate: [-13, -11, -13] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}><svg viewBox="0 0 150 150"><path d="M75 72C33 4 5 31 28 72c-39 1-27 49 16 39 4 32 35 31 31-39Zm0 0C117 4 145 31 122 72c39 1 27 49-16 39-4 32-35 31-31-39Z"/><path d="M75 72v42m0-42 13-32m-13 32L61 40"/></svg></motion.div>
      <div className="decor decor-ribbon" aria-hidden="true" />
      <div className="decor decor-corner" aria-hidden="true"><Sparkles size={46} /></div>

      <section className="hero-section">
        <motion.div className="hero-copy" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
          <p className="eyebrow"><span className="eyebrow-dot" /> AI background removal, made effortless</p>
          <TypewriterHeading reduceMotion={reduceMotion} />
          <p className="hero-subtitle">Create clean, professional images effortlessly. Upload your photo and let<br className="desktop-break" /> <span>PIXCLEAR</span> do the work.</p>
        </motion.div>

        <motion.div className="hero-showcase" initial={{ opacity: 0, scale: 0.975 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.12 }}>
          <div className="landing-samples">
            <motion.figure className="landing-example" whileHover={{ y: -4, scale: 1.012 }} transition={{ type: 'spring', stiffness: 360, damping: 27 }}><div className="landing-example-image"><img src="/images/landing-original.webp" alt="Portrait with its original background" /></div><figcaption>ORIGINAL</figcaption></motion.figure>
            <motion.figure className="landing-example" whileHover={{ y: -4, scale: 1.012 }} transition={{ type: 'spring', stiffness: 360, damping: 27 }}><div className="landing-example-image landing-example-cutout"><img src="/images/landing-cutout.webp" alt="The same portrait with its background removed" /></div><figcaption>BACKGROUND REMOVED</figcaption></motion.figure>
          </div>
        </motion.div>

        <motion.div className="hero-upload" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.22 }}>
          <Dropzone />
        </motion.div>
        <p className="privacy-note"><ShieldCheck size={16} /> Your image stays on your device. AI processing runs in your browser.</p>
      </section>

      <InView id="features" className="landing-section features-section">
        <div className="section-heading"><p className="eyebrow">Made for your next idea</p><h2>Beautiful images. <em>Zero background</em> hassle.</h2><p>From product shots to profile pictures, get a clean cutout without a complicated workflow.</p></div>
        <motion.div className="feature-grid" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
          {[
            [<Sparkles size={24} />, 'AI-powered cutouts', 'Fine edges and clear subjects, processed privately on your device.'],
            [<ImagePlus size={24} />, 'Made for your workflow', 'Add JPG, PNG, or WEBP images, review the result, and save as a transparent PNG.'],
            [<ShieldCheck size={24} />, 'Private by design', 'Your selected image is processed locally in your browser, not uploaded to a PIXCLEAR server.'],
          ].map(([icon, title, text]) => <motion.article className="feature-card" variants={fadeUp} whileHover={{ y: -5, scale: 1.012 }} transition={{ type: 'spring', stiffness: 360, damping: 28 }} key={title}><div className="feature-icon">{icon}</div><h3>{title}</h3><p>{text}</p></motion.article>)}
        </motion.div>
      </InView>

      <InView id="how-it-works" className="landing-section how-section">
        <div className="section-heading"><p className="eyebrow">Three simple steps</p><h2>From photo to <em>transparent PNG</em></h2></div>
        <motion.div className="steps-row" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.11 } } }} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.22 }}>
          {[['01', 'Upload your image', 'Drop in a JPG, PNG or WEBP up to 10MB.'], ['02', 'Let AI do the work', 'The open-source model runs locally in your browser.'], ['03', 'Download your cutout', 'Compare the result and save a transparent PNG.']].map(([number, title, text]) => <motion.article className="step-card" variants={fadeUp} whileHover={{ y: -4 }} transition={{ duration: 0.22 }} key={number}><span className="step-number">{number}</span><div><h3>{title}</h3><p>{text}</p></div><ArrowRight size={19} className="step-arrow" /></motion.article>)}
        </motion.div>
        <MotionLink className="text-cta" to="/dashboard">Open your workspace <ArrowRight size={18} /></MotionLink>
      </InView>

      <InView id="pricing" className="landing-section pricing-section">
        <div className="section-heading"><p className="eyebrow">Simple and transparent</p><h2>Start creating <em>for free</em></h2><p>No per-image fee. Model processing happens on your device.</p></div>
        <motion.article className="price-card" whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
          <div className="price-card-top"><div><span className="price-kicker">PIXCLEAR</span><h3>Browser edition</h3></div><div className="price-amount">$0<span> / always</span></div></div>
          <p className="price-description">Everything you need to make your first transparent cutout.</p>
          <ul>{['AI background removal in your browser', 'JPG, PNG and WEBP input', 'Transparent PNG export', 'No image upload to our server'].map((feature) => <li key={feature}><Check size={17} /> {feature}</li>)}</ul>
          <MotionLink className="button button-primary price-button" to="/signup">Get Started <ArrowRight size={17} /></MotionLink>
          <span className="price-footnote">First-time model download is about 40MB and is cached by your browser.</span>
        </motion.article>
      </InView>

      <footer className="landing-footer"><BrandLogo /><span>Beautiful images. Zero background hassle.</span><a className="footer-back-to-top" href="#top" onClick={(event) => { event.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Back to top ↑</a><small>© {new Date().getFullYear()} PIXCLEAR · Privacy-first image tools · <a className="footer-license" href="/licenses/IMG-LY-AGPL-3.0.txt">Open-source AI license</a></small></footer>
    </main>
  );
}
