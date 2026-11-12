import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { auth, firebaseConfigured } from './firebase';

function requireAuth() {
  if (!firebaseConfigured || !auth) {
    throw new Error('Firebase is not configured yet. Add this Firebase web app’s API key to .env.local and configure the required Firebase services.');
  }
  return auth;
}

export function toAppUser(user, fallbackName = '') {
  if (!user) return null;
  return {
    uid: user.uid,
    name: user.displayName || fallbackName || user.email?.split('@')[0] || 'PIXCLEAR user',
    email: user.email || '',
  };
}

export function observeAuth(callback, onError = () => {}) {
  if (!firebaseConfigured || !auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback, onError);
}

export async function createAccount({ name, email, password, remember = true }) {
  const service = requireAuth();
  await setPersistence(service, remember ? browserLocalPersistence : browserSessionPersistence);
  const credential = await createUserWithEmailAndPassword(service, email.trim(), password);
  const cleanName = name.trim();
  try {
    await updateProfile(credential.user, { displayName: cleanName });
  } catch {
    // Firebase Auth already created and signed in the account; use the entered name for this session.
  }
  return toAppUser(credential.user, cleanName);
}

export async function signIn({ email, password, remember = true }) {
  const service = requireAuth();
  await setPersistence(service, remember ? browserLocalPersistence : browserSessionPersistence);
  const credential = await signInWithEmailAndPassword(service, email.trim(), password);
  return toAppUser(credential.user);
}

export async function requestPasswordReset(email) {
  const service = requireAuth();
  await sendPasswordResetEmail(service, email.trim());
}

export async function signOut() {
  if (auth) await firebaseSignOut(auth);
}

export function authErrorMessage(error) {
  const messages = {
    'auth/email-already-in-use': 'An account already uses this email. Log in instead.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/invalid-credential': 'The email or password is incorrect.',
    'auth/user-not-found': 'No account was found for this email. Create an account first.',
    'auth/wrong-password': 'The email or password is incorrect.',
    'auth/weak-password': 'Choose a stronger password with at least 8 characters.',
    'auth/operation-not-allowed': 'Email/password sign-in is not enabled in Firebase Authentication yet.',
    'auth/network-request-failed': 'Could not reach Firebase. Check your internet connection and try again.',
    'auth/too-many-requests': 'Too many attempts were made. Wait a little and try again.',
    'auth/invalid-api-key': 'The Firebase API key is missing or invalid. Check the Firebase web app configuration.',
  };
  return messages[error?.code] || error?.message || 'We could not complete that request. Please try again.';
}
