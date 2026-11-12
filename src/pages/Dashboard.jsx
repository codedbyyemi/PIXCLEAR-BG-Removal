
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import MotionButton from '../components/MotionButton';
import MotionLink from '../components/MotionLink';
import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  CircleHelp,
  FolderOpen,
  Home,
  Image,
  LayoutDashboard,
  LogOut,
  Settings,
  Sparkles,
  WandSparkles,
  X,
} from 'lucide-react';
import { usePixclear } from '../App';
import BrandLogo from '../components/BrandLogo';
import Dropzone from '../components/Dropzone';
import Modal from '../components/Modal';

const sidebarItems = [
  { id: 'home', label: 'Home', icon: <Home size={21} fill="currentColor" /> },
  { id: 'projects', label: 'Projects', icon: <FolderOpen size={21} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={21} /> },
  { id: 'support', label: 'Help & Support', icon: <CircleHelp size={21} /> },
];

export default function Dashboard() {
  const navigate = useNavigate();

  const {
    items,
    setSelectedId,
    user,
    setUser,
    signOut,
    downloadCount,
    preferences,
    updatePreferences,
    setInitialTool,
    removeItem,
  } = usePixclear();

  const [panel, setPanel] = useState('home');
  const [modal, setModal] = useState('');

  // User profile information
  const displayName =
    user?.name || user?.email?.split('@')[0] || 'PIXCLEAR User';

  const firstName = displayName.trim().split(/\s+/)[0] || 'there';

  const avatarLetter = (
    user?.name?.trim()?.[0] ||
    user?.email?.trim()?.[0] ||
    'P'
  ).toUpperCase();

  const stats = [
    {
      label: 'Total Images',
      value: items.length,
      icon: <Image size={22} />,
      tone: 'purple',
    },
    {
      label: 'Completed',
      value: items.filter((item) => item.status === 'done').length,
      icon: <Check size={21} />,
      tone: 'mint',
    },
    {
      label: 'Downloads',
      value: downloadCount,
      icon: <ArrowDownToLine size={22} />,
      tone: 'purple',
    },
  ];

  const openTool = (tool) => {
    setInitialTool(tool);
    navigate('/editor');
  };

  const openProject = (id) => {
    setSelectedId(id);
    setInitialTool('background');
    navigate('/editor');
  };

  const logout = async () => {
    await signOut();
    setUser(null);
    navigate('/');
  };

  return (
    <main className="dashboard-page">
      <aside className="dashboard-sidebar">
        <BrandLogo />

        <nav className="dashboard-nav" aria-label="Dashboard navigation">
          {sidebarItems.map((item) => (
            <MotionButton
              key={item.id}
              type="button"
              className={`dashboard-nav-item ${
                panel === item.id ? 'is-active' : ''
              }`}
              onClick={() => setPanel(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </MotionButton>
          ))}
        </nav>

        <div className="sidebar-spacer" />

        <div className="profile-card">
          <div className="profile-avatar">
            {avatarLetter}
          </div>

          <div className="profile-copy">
            <strong>{displayName}</strong>
            <span>{user?.email || ''}</span>
          </div>

          <MotionButton
            type="button"
            aria-label="Sign out"
            className="profile-logout"
            title="Sign out"
            onClick={logout}
          >
            <LogOut size={15} />
          </MotionButton>

          <MotionButton
            type="button"
            className="upgrade-pill"
            onClick={() => setModal('upgrade')}
          >
            <Sparkles size={14} /> Upgrade Now
          </MotionButton>
        </div>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-mobile-head">
          <BrandLogo />
          <MotionLink to="/" className="dashboard-home-link">
            Website <ArrowRight size={16} />
          </MotionLink>
          <MotionButton
            type="button"
            className="dashboard-mobile-signout"
            onClick={logout}
          >
            <LogOut size={15} /> Sign out
          </MotionButton>
        </header>

        <AnimatePresence mode="wait" initial={false}>
          {panel === 'home' && (
            <motion.div
              key="home"
              className="dashboard-content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              <div className="dashboard-welcome">
                <h1>
                  Welcome Back, <em>{firstName}!</em>
                </h1>
                <p>Ready to create something amazing today?</p>
              </div>

              <div className="stats-grid">
                {stats.map((stat, index) => (
                  <motion.article
                    className="stat-card"
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -3 }}
                    transition={{ delay: index * 0.08, duration: 0.22 }}
                  >
                    <div className={`stat-icon ${stat.tone}`}>
                      {stat.icon}
                    </div>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </motion.article>
                ))}
              </div>

              <div className="dashboard-upload">
                <Dropzone compact />
              </div>

              <div className="quick-actions">
                <MotionButton
                  className="quick-action quick-action-primary"
                  onClick={() => setPanel('projects')}
                >
                  <span>View Projects</span>
                  <FolderOpen size={21} />
                </MotionButton>

                <MotionButton
                  className="quick-action"
                  onClick={() => openTool('erase')}
                >
                  <span>Erase Object</span>
                  <WandSparkles size={21} />
                </MotionButton>

                <MotionButton
                  className="quick-action"
                  onClick={() => setModal('upscale')}
                >
                  <span>Upscale Images</span>
                  <Sparkles size={20} />
                </MotionButton>
              </div>

              {items.length > 0 && (
                <div className="recent-strip">
                  <div>
                    <span className="eyebrow">YOUR WORKSPACE</span>
                    <h2>Recent images</h2>
                  </div>

                  <MotionButton
                    className="text-cta"
                    onClick={() => setPanel('projects')}
                  >
                    View all <ArrowRight size={16} />
                  </MotionButton>

                  <div className="recent-thumbs">
                    {items.slice(-4).reverse().map((item) => (
                      <motion.button
                        className="recent-thumb"
                        key={item.id}
                        onClick={() => openProject(item.id)}
                        whileHover={{ y: -3, scale: 1.015 }}
                        whileTap={{ scale: 0.985 }}
                      >
                        <img
                          src={item.resultUrl || item.originalUrl}
                          alt={item.name}
                        />
                        <span>
                          {item.status === 'done'
                            ? 'Ready'
                            : item.status === 'processing'
                              ? 'Working…'
                              : 'Open editor'}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {panel === 'projects' && (
            <motion.div
              key="projects"
              className="dashboard-content subpage-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              <div className="subpage-heading">
                <span className="eyebrow">YOUR WORKSPACE</span>
                <h1>Projects</h1>
                <p>Review this session’s images or add another batch.</p>
              </div>

              {items.length === 0 ? (
                <div className="empty-projects">
                  <div className="empty-projects-icon">
                    <LayoutDashboard size={27} />
                  </div>
                  <h2>No images yet</h2>
                  <p>
                    Upload your first image to start a PIXCLEAR project.
                  </p>
                  <Dropzone
                    compact
                    title="Upload your image"
                    subtitle="Drag and drop images here or browse files"
                    buttonLabel="Choose an image"
                  />
                </div>
              ) : (
                <div className="projects-list">
                  {items.map((item) => (
                    <article className="project-row" key={item.id}>
                      <img src={item.resultUrl || item.originalUrl} alt="" />

                      <div className="project-row-copy">
                        <strong>{item.name}</strong>
                        <span>
                          {item.status === 'done'
                            ? 'Background removed'
                            : item.status === 'processing'
                              ? 'Processing'
                              : item.status === 'error'
                                ? item.error
                                : 'Ready to process'}
                        </span>
                      </div>

                      <span className={`status-tag ${item.status}`}>
                        {item.status === 'done'
                          ? 'Completed'
                          : item.status === 'processing'
                            ? 'Processing'
                            : item.status === 'error'
                              ? 'Error'
                              : 'Ready'}
                      </span>

                      <MotionButton
                        className="button button-outline button-small"
                        onClick={() => openProject(item.id)}
                      >
                        Open
                      </MotionButton>

                      <MotionButton
                        className="icon-button"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name}`}
                      >
                        <X size={17} />
                      </MotionButton>
                    </article>
                  ))}
                </div>
              )}

              {items.length > 0 && (
                <div className="projects-add">
                  <Dropzone
                    compact
                    title="Add more images"
                    subtitle="Drag and drop another batch here"
                    buttonLabel="Browse Files"
                  />
                </div>
              )}
            </motion.div>
          )}

          {panel === 'settings' && (
            <motion.div
              key="settings"
              className="dashboard-content subpage-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              <div className="subpage-heading">
                <span className="eyebrow">PREFERENCES</span>
                <h1>Settings</h1>
                <p>Choose the on-device AI model used for future images.</p>
              </div>

              <section className="settings-card">
                <div className="settings-card-icon">
                  <Settings size={23} />
                </div>

                <div className="settings-card-copy">
                  <h2>Background removal model</h2>
                  <p>
                    Choose between a compact quantized model and a larger
                    full-precision model. Both process images on your device.
                  </p>

                  <label className="settings-select-label" htmlFor="model-select">
                    AI model
                  </label>

                  <select
                    id="model-select"
                    value={preferences.model}
                    onChange={(event) =>
                      updatePreferences({ model: event.target.value })
                    }
                  >
                    <option value="isnet_quint8">
                      Compact — about 40MB, faster
                    </option>
                    <option value="isnet">
                      Full — about 80MB, more detail
                    </option>
                  </select>

                  <small>
                    The model is downloaded from IMG.LY once and then reused
                    from your browser's cache.
                  </small>
                </div>
              </section>

              <section className="settings-card privacy-card">
                <div className="settings-card-icon mint">
                  <Check size={23} />
                </div>

                <div className="settings-card-copy">
                  <h2>Privacy</h2>
                  <p>
                    Image files and results are processed in your browser and
                    aren’t uploaded to Firebase. Firebase stores your account,
                    model preference and download count; images and work
                    history remain in memory for this session.
                  </p>
                </div>
              </section>
            </motion.div>
          )}

          {panel === 'support' && (
            <motion.div
              key="support"
              className="dashboard-content subpage-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              <div className="subpage-heading">
                <span className="eyebrow">HERE TO HELP</span>
                <h1>Help &amp; Support</h1>
                <p>Quick answers for getting clean, transparent images.</p>
              </div>

              <div className="help-cards">
                <article>
                  <h2>Which files work?</h2>
                  <p>
                    PIXCLEAR accepts JPG/JPEG, PNG, and WEBP files up to 10MB
                    each. You can add several images at once.
                  </p>
                </article>

                <article>
                  <h2>Why is the first run slower?</h2>
                  <p>
                    Your browser downloads the open-source AI model once and
                    then reuses its cache. PixClear uses GPU acceleration when
                    available and falls back to CPU processing if the graphics
                    runtime fails.
                  </p>
                </article>

                <article>
                  <h2>Where are my images processed?</h2>
                  <p>
                    Background removal runs in your browser. Your input file
                    isn’t uploaded to a PIXCLEAR server.
                  </p>
                </article>

                <article>
                  <h2>What if processing fails?</h2>
                  <p>
                    Check your connection for the first model download, then
                    retry. If the graphics runtime fails, PixClear
                    automatically attempts CPU processing.
                  </p>
                </article>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <Modal
        open={Boolean(modal)}
        onClose={() => setModal('')}
        title={
          modal === 'upscale'
            ? 'Upscale images'
            : 'PIXCLEAR browser edition'
        }
      >
        {modal === 'upscale' ? (
          <>
            <p className="modal-copy">
              This design reference includes an Upscale shortcut, but the
              PIXCLEAR release implements the background-removal workflow
              only. No image is modified by this shortcut.
            </p>

            <div className="modal-actions">
              <MotionButton
                className="button button-outline"
                onClick={() => setModal('')}
              >
                Close
              </MotionButton>

              <MotionButton
                className="button button-primary"
                onClick={() => {
                  setModal('');
                  openTool('background');
                }}
              >
                Use background remover
              </MotionButton>
            </div>
          </>
        ) : (
          <>
            <p className="modal-copy">
              PIXCLEAR uses an open-source AI model in your browser. There is
              no paid API or subscription checkout in this release.
            </p>

            <div className="modal-actions">
              <MotionButton
                className="button button-primary"
                onClick={() => setModal('')}
              >
                Continue for free
              </MotionButton>
            </div>
          </>
        )}
      </Modal>
    </main>
  );
}
