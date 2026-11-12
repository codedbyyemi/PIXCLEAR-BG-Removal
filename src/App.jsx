import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { observeAuth, signOut, toAppUser } from './lib/account';
import { firebaseConfigured } from './lib/firebase';
import { loadOrCreateProfile, saveProfile } from './lib/profile';
import { removeImageBackground } from './lib/backgroundRemoval';
import Landing from './pages/Landing';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Success from './pages/Success';

const PixclearContext = createContext(null);
export const usePixclear = () => useContext(PixclearContext);
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_EXTENSIONS = /\.(jpe?g|png|webp)$/i;

function readPreferences() {
  try {
    const value = JSON.parse(localStorage.getItem('pixclear.preferences.v1') || '{}');
    return { model: value.model === 'isnet' ? 'isnet' : 'isnet_quint8' };
  } catch {
    return { model: 'isnet_quint8' };
  }
}

function AppFrame() {
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState([]);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const [selectedId, setSelectedId] = useState(null);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(!firebaseConfigured);
  const [notice, setNotice] = useState('');
  const [downloadCount, setDownloadCount] = useState(() => Number(localStorage.getItem('pixclear.downloads') || 0));
  const [preferences, setPreferences] = useState(readPreferences);
  const [initialTool, setInitialTool] = useState('background');
  const inFlight = useRef(new Set());
  const selected = items.find((item) => item.id === selectedId) || items[0] || null;

  useEffect(() => {
    let active = true;
    let authRevision = 0;
    const unsubscribe = observeAuth((firebaseUser) => {
      const revision = ++authRevision;
      const account = toAppUser(firebaseUser);
      setUser(account);
      setAuthReady(true);
      if (!account) {
        setDownloadCount(0);
        setPreferences(readPreferences());
        return;
      }
      loadOrCreateProfile(account).then((profile) => {
        if (!active || revision !== authRevision || !profile) return;
        setDownloadCount(profile.downloads);
        setPreferences({ model: profile.model });
      }).catch(() => {
        if (active && revision === authRevision) {
          setNotice('You are signed in, but profile sync is unavailable. Check that Cloud Firestore is enabled and its rules are published.');
        }
      });
    }, () => {
      if (active) setAuthReady(true);
    });
    return () => { active = false; unsubscribe(); };
  }, []);

  useEffect(() => () => {
    itemsRef.current.forEach((item) => {
      [item.originalUrl, item.resultUrl, item.baseResultUrl].filter(Boolean).forEach((url, index, urls) => {
        if (urls.indexOf(url) === index) URL.revokeObjectURL(url);
      });
    });
  }, []);

  const addFiles = useCallback((list) => {
    const accepted = [];
    const rejected = [];
    Array.from(list || []).forEach((file) => {
      const validType = ALLOWED_TYPES.has(file.type) || ALLOWED_EXTENSIONS.test(file.name);
      if (!validType) rejected.push(`${file.name}: choose a JPG, PNG, or WEBP image.`);
      else if (file.size > MAX_BYTES) rejected.push(`${file.name}: the maximum file size is 10 MB.`);
      else {
        accepted.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          file,
          name: file.name,
          originalUrl: URL.createObjectURL(file),
          resultUrl: null,
          baseResultUrl: null,
          status: 'ready',
          phase: null,
          progress: null,
          error: '',
          edited: false,
        });
      }
    });
    if (accepted.length) {
      setItems((current) => [...current, ...accepted]);
      setSelectedId(accepted[0].id);
      setNotice(rejected.length ? rejected.join(' ') : '');
      navigate('/editor');
    } else if (rejected.length) setNotice(rejected.join(' '));
    return accepted.length;
  }, [navigate]);

  const removeItem = useCallback((id) => {
    const target = itemsRef.current.find((item) => item.id === id);
    if (target) [target.originalUrl, target.resultUrl, target.baseResultUrl].filter(Boolean).forEach((url, index, urls) => {
      if (urls.indexOf(url) === index) URL.revokeObjectURL(url);
    });
    const next = itemsRef.current.filter((item) => item.id !== id);
    setItems(next);
    if (selectedId === id) setSelectedId(next[0]?.id || null);
  }, [selectedId]);

  const processImage = useCallback(async (id) => {
    const item = itemsRef.current.find((entry) => entry.id === id);
    if (!item || inFlight.current.has(id) || item.status === 'processing') return;
    inFlight.current.add(id);
    setItems((current) => current.map((entry) => entry.id === id ? { ...entry, status: 'processing', phase: 'preparing', progress: null, error: '' } : entry));
    try {
      const resultBlob = await removeImageBackground(item.file, {
        model: preferences.model,
        onStage: (phase) => setItems((current) => current.map((entry) => entry.id === id ? { ...entry, phase, progress: phase === 'processing' ? null : entry.progress } : entry)),
        onProgress: (_asset, current, total) => {
          if (total > 0) {
            const progress = Math.min(99, Math.round((current / total) * 100));
            setItems((currentItems) => currentItems.map((entry) => entry.id === id ? { ...entry, phase: 'preparing', progress } : entry));
          }
        },
      });
      if (!itemsRef.current.some((entry) => entry.id === id)) return;
      const resultUrl = URL.createObjectURL(resultBlob);
      setItems((current) => current.map((entry) => {
        if (entry.id !== id) return entry;
        [entry.resultUrl, entry.baseResultUrl].filter(Boolean).forEach((url, index, urls) => {
          if (urls.indexOf(url) === index) URL.revokeObjectURL(url);
        });
        return { ...entry, status: 'done', phase: null, resultUrl, baseResultUrl: resultUrl, progress: 100, error: '', edited: false };
      }));
    } catch (error) {
      const message = error?.message || 'The background removal could not be completed. Check your connection and try again.';
      setItems((current) => current.map((entry) => entry.id === id ? { ...entry, status: 'error', phase: null, progress: null, error: message } : entry));
    } finally {
      inFlight.current.delete(id);
    }
  }, [preferences.model]);

  const processQueue = useCallback(async (onlyId = null) => {
    const targets = onlyId ? [onlyId] : itemsRef.current.filter((item) => item.status !== 'done' && item.status !== 'processing').map((item) => item.id);
    for (const id of targets) {
      setSelectedId(id);
      await processImage(id);
    }
  }, [processImage]);

  const replaceResult = useCallback((id, blob) => {
    const url = URL.createObjectURL(blob);
    setItems((current) => current.map((entry) => {
      if (entry.id !== id) return entry;
      if (entry.resultUrl && entry.resultUrl !== entry.baseResultUrl) URL.revokeObjectURL(entry.resultUrl);
      return { ...entry, resultUrl: url, status: 'done', error: '', edited: true };
    }));
  }, []);

  const resetResult = useCallback((id) => {
    setItems((current) => current.map((entry) => {
      if (entry.id !== id) return entry;
      if (entry.resultUrl && entry.resultUrl !== entry.baseResultUrl) URL.revokeObjectURL(entry.resultUrl);
      return { ...entry, resultUrl: entry.baseResultUrl || null, status: entry.baseResultUrl ? 'done' : 'ready', edited: false, error: '' };
    }));
  }, []);

  const downloadImage = useCallback((id) => {
    const item = itemsRef.current.find((entry) => entry.id === id);
    if (!item?.resultUrl) return;
    const link = document.createElement('a');
    link.href = item.resultUrl;
    const suffix = item.baseResultUrl ? '-transparent.png' : '-edited.png';
    link.download = `${item.name.replace(/\.[^.]+$/, '')}${suffix}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    const count = downloadCount + 1;
    localStorage.setItem('pixclear.downloads', String(count));
    setDownloadCount(count);
    if (user?.uid) saveProfile(user, { downloads: count, model: preferences.model }).catch(() => {});
    navigate('/success');
  }, [downloadCount, navigate, preferences.model, user]);

  const updatePreferences = useCallback((patch) => {
    const next = { ...preferences, ...patch };
    setPreferences(next);
    localStorage.setItem('pixclear.preferences.v1', JSON.stringify(next));
    if (user?.uid) saveProfile(user, { downloads: downloadCount, model: next.model }).catch(() => {});
  }, [downloadCount, preferences, user]);

  const context = useMemo(() => ({
    items, selected, selectedId, setSelectedId, addFiles, removeItem, processImage, processQueue,
    replaceResult, resetResult, downloadImage, user, setUser, signOut, notice, setNotice,
    downloadCount, preferences, updatePreferences, initialTool, setInitialTool, authReady, firebaseConfigured,
  }), [items, selected, selectedId, addFiles, removeItem, processImage, processQueue, replaceResult,
    resetResult, downloadImage, user, notice, downloadCount, preferences, updatePreferences, initialTool, authReady]);

  return (
    <PixclearContext.Provider value={context}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={location.pathname} className="route-frame" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
          <Routes location={location}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/signup" element={<AuthPage mode="signup" />} />
            <Route path="/dashboard" element={<ProtectedDashboard />} />
            <Route path="/editor" element={<Editor />} />
            <Route path="/success" element={<Success />} />
            <Route path="*" element={<Landing />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </PixclearContext.Provider>
  );
}

function ProtectedDashboard() {
  const { authReady, user } = usePixclear();
  if (!authReady) return <main className="auth-page"><section className="auth-form-panel"><p role="status">Checking your account…</p></section></main>;
  if (!user) return <Navigate to="/login" replace />;
  return <Dashboard />;
}

export default function App() {
  return <MotionConfig reducedMotion="user"><BrowserRouter><AppFrame /></BrowserRouter></MotionConfig>;
}
