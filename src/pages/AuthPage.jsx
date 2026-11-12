import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { authErrorMessage, createAccount, requestPasswordReset, signIn } from '../lib/account';
import { usePixclear } from '../App';
import BrandLogo from '../components/BrandLogo';
import Modal from '../components/Modal';
import { motion } from 'framer-motion';
import MotionButton from '../components/MotionButton';
import MotionLink from '../components/MotionLink';

export default function AuthPage({ mode = 'login' }) {
  const isSignup = mode === 'signup';
  const navigate = useNavigate();
  const { setUser, firebaseConfigured } = usePixclear();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (isSignup && name.trim().length < 2) return setError('Enter your full name to create an account.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('Enter a valid email address.');
    if (password.length < 8) return setError('Use a password with at least 8 characters.');
    setBusy(true);
    try {
      const account = isSignup
        ? await createAccount({ name, email, password, remember })
        : await signIn({ email, password, remember });
      setUser(account);
      navigate('/dashboard');
    } catch (authError) {
      setError(authErrorMessage(authError));
    } finally {
      setBusy(false);
    }
  };

  const sendResetEmail = async () => {
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter your account email address in the form first.');
      return;
    }
    setBusy(true);
    try {
      await requestPasswordReset(email);
      setResetSent(true);
    } catch (resetError) {
      setError(authErrorMessage(resetError));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className={`auth-page ${isSignup ? 'auth-signup' : 'auth-login'}`}>
      <section className={`auth-art-panel ${isSignup ? 'auth-art-light' : ''}`}>
        <MotionLink className="auth-back" to="/" aria-label="Back to home"><ArrowLeft size={28} /></MotionLink>
        {isSignup ? <BrandLogo size="large" /> : <BrandLogo light size="large" />}
        <p className="auth-tagline">Beautiful images. Zero background<br /> hassle.</p>
        {!isSignup && <img className="auth-ribbon" src="/images/auth-art.webp" alt="" aria-hidden="true" />}
        {isSignup && <img className="auth-orb" src="/images/signup-orb.webp" alt="" aria-hidden="true" />}
        <div className="auth-social"><span>You can reach us on:</span><span aria-hidden="true"><TwitterIcon /><FacebookMark /><InstagramMark /><YouTubeMark /></span></div>
      </section>

      <section className="auth-form-panel">
        <motion.div className="auth-form-wrap" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <h1>{isSignup ? 'Sign Up!' : 'Welcome Back!'}</h1>
          <p className={`auth-subtitle ${isSignup ? 'auth-purple' : ''}`}>{isSignup ? 'Join the latest designers community today' : 'Please enter your login details below'}</p>
          <form onSubmit={submit} noValidate>
            {isSignup && <label className="form-field"><span>Your full name</span><input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter your full name" /></label>}
            <label className="form-field"><span>Email Address</span><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter your email address" /></label>
            <label className="form-field"><span>Password</span><div className="password-input-wrap"><input type={showPassword ? 'text' : 'password'} autoComplete={isSignup ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" /><MotionButton type="button" className="password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((show) => !show)}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</MotionButton></div></label>
            {!isSignup && <div className="auth-form-options"><label className="remember-option"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /><span>Remember me</span></label><MotionButton type="button" className="inline-link" onClick={() => { setError(''); setResetSent(false); setForgotOpen(true); }}>Forgot Password?</MotionButton></div>}
            {error && <motion.p className="form-error" role="alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>{error}</motion.p>}
            {!firebaseConfigured && <p className="form-error" role="status">Firebase setup is incomplete. Add the full web API key to `.env.local` and enable Email/Password Authentication.</p>}
            <MotionButton type="submit" className="button button-primary auth-submit" disabled={busy || !firebaseConfigured}>{busy ? <><span className="button-spinner" /> Please wait…</> : isSignup ? 'Create account' : <><LockKeyhole size={18} /> Log In</>}</MotionButton>
          </form>
          <p className="local-account-note">PIXCLEAR uses Firebase for account security. Your image files and background removal stay on this device.</p>
          {isSignup ? <p className="auth-switch">Already have an account? <MotionLink to="/login">Log in</MotionLink></p> : <p className="auth-switch">New to PIXCLEAR? <MotionLink to="/signup">Create an account</MotionLink></p>}
        </motion.div>
      </section>
      <Modal open={forgotOpen} onClose={() => setForgotOpen(false)} title="Password recovery">
        <p className="modal-copy">{resetSent ? `A password reset link has been sent to ${email.trim()}. Check your inbox.` : 'Enter the email address for your PIXCLEAR account. Firebase will email you a password reset link.'}</p>
        {error && <motion.p className="form-error" role="alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>{error}</motion.p>}
        <div className="modal-actions"><MotionButton className="button button-outline" onClick={() => setForgotOpen(false)}>Close</MotionButton><MotionButton className="button button-primary" disabled={busy || resetSent || !firebaseConfigured} onClick={sendResetEmail}>{busy ? 'Sending…' : resetSent ? 'Email sent' : 'Send reset email'}</MotionButton></div>
      </Modal>
    </main>
  );
}

function TwitterIcon() {
  return <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M22 5.9a8.4 8.4 0 0 1-2.36.65 4.12 4.12 0 0 0 1.8-2.27 8.2 8.2 0 0 1-2.6.99 4.1 4.1 0 0 0-7 3.74A11.63 11.63 0 0 1 3.4 4.73a4.1 4.1 0 0 0 1.27 5.48 4.08 4.08 0 0 1-1.86-.51v.05a4.1 4.1 0 0 0 3.29 4.02 4.1 4.1 0 0 1-1.85.07 4.1 4.1 0 0 0 3.83 2.85A8.23 8.23 0 0 1 2 18.38 11.6 11.6 0 0 0 8.29 20.2c7.55 0 11.68-6.25 11.68-11.67l-.01-.53A8.3 8.3 0 0 0 22 5.9Z" /></svg>;
}

function FacebookMark() {
  return <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M13.5 21v-8.2h2.8l.42-3.2H13.5V7.56c0-.93.26-1.56 1.6-1.56h1.7V3.14C16.5 3.06 15.42 3 14.16 3 11.5 3 9.7 4.62 9.7 7.6v2H7v3.2h2.7V21z" /></svg>;
}

function InstagramMark() {
  return <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" /></svg>;
}

function YouTubeMark() {
  return <svg viewBox="0 0 24 24" width="25" height="25" aria-hidden="true"><path fill="currentColor" d="M23.5 6.2a3 3 0 0 0-2.12-2.13C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.52A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.12 2.13c1.88.52 9.38.52 9.38.52s7.5 0 9.38-.52a3 3 0 0 0 2.12-2.13A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.55 15.7V8.3L15.8 12z" /></svg>;
}
