import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import MotionButton from '../components/MotionButton';
import MotionLink from '../components/MotionLink';
import { ArrowLeft, ArrowRight, Brush, Check, Download, Eraser, LoaderCircle, Menu, RotateCcw, Sparkles, WandSparkles, X } from 'lucide-react';
import { usePixclear } from '../App';
import BrandLogo from '../components/BrandLogo';
import ComparisonSlider from '../components/ComparisonSlider';
import Dropzone from '../components/Dropzone';
import Modal from '../components/Modal';

export default function Editor() {
  const navigate = useNavigate();
  const {
    items,
    selected,
    selectedId,
    setSelectedId,
    addFiles,
    processImage,
    processQueue,
    replaceResult,
    resetResult,
    downloadImage,
    initialTool,
    setInitialTool,
    notice,
    setNotice,
  } = usePixclear();
  const [tool, setTool] = useState(initialTool || 'background');
  const [eraserActive, setEraserActive] = useState(false);
  const [brushSize, setBrushSize] = useState(38);
  const [hue, setHue] = useState(45);
  const [colourBusy, setColourBusy] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modal, setModal] = useState('');

  useEffect(() => {
    setTool(initialTool || 'background');
    setInitialTool('background');
  }, [initialTool, setInitialTool]);

  const sourceForCanvas = selected?.resultUrl || selected?.originalUrl;

  const applyColour = async () => {
    if (!sourceForCanvas || !selected) return;
    setColourBusy(true);
    try {
      const response = await fetch(sourceForCanvas);
      const bitmap = await createImageBitmap(await response.blob());
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Image editing is not available in this browser.');
      context.filter = `hue-rotate(${hue}deg) saturate(1.25)`;
      context.drawImage(bitmap, 0, 0);
      bitmap.close?.();
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((value) => value ? resolve(value) : reject(new Error('Could not create the color-adjusted PNG.')), 'image/png');
      });
      replaceResult(selected.id, blob);
      setTool('background');
    } catch (error) {
      setNotice(error?.message || 'Could not apply that colour adjustment.');
    } finally {
      setColourBusy(false);
    }
  };

  const loadSample = async () => {
    try {
      const response = await fetch('/images/landing-original.webp');
      if (!response.ok) throw new Error('The sample image could not be loaded.');
      const blob = await response.blob();
      const sampleFile = new File([blob], 'pixclear-portrait-sample.webp', { type: 'image/webp' });
      setNotice('');
      addFiles([sampleFile]);
    } catch {
      setNotice('The sample image could not be loaded. Please choose a file from your device.');
    }
  };

  const activateTool = (nextTool) => {
    setTool(nextTool);
    setEraserActive(false);
  };

  const startAction = () => {
    if (!selected) return;
    if (tool === 'background') processImage(selected.id);
    if (tool === 'erase') setEraserActive((active) => !active);
    if (tool === 'colourize') applyColour();
  };

  const reviewImage = () => {
    (document.getElementById('review-comparison') || document.getElementById('editor-preview-canvas'))
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <main className="editor-page">
      <header className="editor-header">
        <MotionLink to="/dashboard" className="editor-back" aria-label="Back to dashboard"><ArrowLeft size={26} /></MotionLink>
        <BrandLogo size="small" to="/" />
        <nav className={`editor-top-nav ${mobileMenuOpen ? 'is-open' : ''}`} aria-label="Editor navigation">
          <MotionButton onClick={() => { setMobileMenuOpen(false); navigate('/dashboard'); }}>Projects</MotionButton>
          <MotionButton onClick={() => { setMobileMenuOpen(false); setModal('help'); }}>Help</MotionButton>
          <MotionButton onClick={() => { setMobileMenuOpen(false); reviewImage(); }}>Review</MotionButton>
          <MotionButton onClick={() => { setMobileMenuOpen(false); setModal('upscale'); }}>Upscale</MotionButton>
          <MotionButton onClick={() => { setMobileMenuOpen(false); setModal('enhance'); }}>Enhance</MotionButton>
        </nav>
        <MotionButton type="button" className="editor-mobile-menu" aria-label={mobileMenuOpen ? 'Close editor menu' : 'Open editor menu'} aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((open) => !open)}><Menu size={20} /></MotionButton>
        <MotionButton className="editor-avatar" onClick={() => navigate('/dashboard')} aria-label="Open dashboard"><img src="/images/ashley-avatar.webp" alt="" /></MotionButton>
      </header>

      <div className="editor-layout">
        <aside className="editor-tools-panel">
          <div className="editor-tools-list" role="group" aria-label="Image editing tools">
            <motion.button whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }} className={`editor-tool ${tool === 'erase' ? 'selected' : ''}`} onClick={() => activateTool('erase')}><Eraser size={20} /><span>Erase</span></motion.button>
            <motion.button whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }} className={`editor-tool ${tool === 'colourize' ? 'selected' : ''}`} onClick={() => activateTool('colourize')}><Sparkles size={20} /><span>Colourize</span></motion.button>
            <motion.button whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }} className={`editor-tool editor-tool-compact ${tool === 'background' ? 'selected' : ''}`} onClick={() => activateTool('background')}><WandSparkles size={19} /><span>Background Remover</span></motion.button>
          </div>

          {notice && <div className="editor-upload-notice" role="alert"><span>{notice}</span><MotionButton type="button" aria-label="Dismiss upload message" onClick={() => setNotice('')}><X size={15} /></MotionButton></div>}

          <AnimatePresence mode="wait" initial={false}>
          {tool === 'erase' && (
            <motion.div key="erase-settings" className="tool-settings" initial={{ opacity: 0, height: 0, y: 5 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -4 }} transition={{ duration: 0.2 }}>
              <label htmlFor="brush-size"><span><Brush size={15} /> Brush size</span><b>{brushSize}px</b></label>
              <input id="brush-size" type="range" min="12" max="96" value={brushSize} onChange={(event) => setBrushSize(Number(event.target.value))} />
              <p>Draw with a pointer or focus the preview: arrow keys move the brush; Space or Enter erases.</p>
            </motion.div>
          )}
          {tool === 'colourize' && (
            <motion.div key="colour-settings" className="tool-settings" initial={{ opacity: 0, height: 0, y: 5 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -4 }} transition={{ duration: 0.2 }}>
              <label htmlFor="hue-range"><span><Sparkles size={15} /> Hue</span><b>{hue}°</b></label>
              <input id="hue-range" type="range" min="0" max="300" value={hue} onChange={(event) => setHue(Number(event.target.value))} />
              <div className="hue-swatches">
                <MotionButton style={{ background: '#8b5cf6' }} aria-label="Purple hue" onClick={() => setHue(270)} />
                <MotionButton style={{ background: '#4e91ed' }} aria-label="Blue hue" onClick={() => setHue(190)} />
                <MotionButton style={{ background: '#f0ad45' }} aria-label="Warm hue" onClick={() => setHue(35)} />
              </div>
              <p>Preview the hue shift, then Apply to keep it.</p>
            </motion.div>
          )}
          </AnimatePresence>

          <div className="editor-control-row">
            <MotionButton className="button button-primary button-small" onClick={startAction} disabled={!selected || selected.status === 'processing' || colourBusy || (tool === 'background' && selected.status === 'done')}>
              {tool === 'background' ? selected?.status === 'done' ? <><Check size={15} /> Removed</> : selected?.status === 'processing' ? <><LoaderCircle size={15} className="spin" /> Working</> : 'Start' : tool === 'erase' ? eraserActive ? 'Finish' : 'Start' : colourBusy ? 'Applying…' : 'Apply'}
            </MotionButton>
            <MotionButton className="button button-outline button-small" onClick={() => selected && resetResult(selected.id)} disabled={!selected}><RotateCcw size={15} /> Reset</MotionButton>
          </div>

          <AnimatePresence mode="wait">
          {selected?.status === 'processing' && (
            <motion.div className="model-status" role="status" initial={{ opacity: 0, y: 8, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}>
              <span className="spinner-ring" />
              <div><strong>{selected.phase === 'processing' ? 'Running AI inference on this device' : selected.progress === null ? 'Preparing the AI model' : `Downloading AI model · ${selected.progress}%`}</strong><span>{selected.phase === 'processing' ? 'The model is ready; larger images may take a little longer.' : 'The first model download is cached for later images.'}</span>{selected.phase === 'preparing' && selected.progress !== null && <div className="progress-track"><i style={{ width: `${selected.progress}%` }} /></div>}</div>
            </motion.div>
          )}
          {selected?.status === 'error' && (
            <motion.div className="inline-error" role="alert" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.2 }}><strong>Couldn’t process this image</strong><span>{selected.error}</span><MotionButton className="inline-link" onClick={() => processImage(selected.id)}>Try again</MotionButton></motion.div>
          )}
          </AnimatePresence>
          {items.length > 1 && (
            <section className="queue-panel">
              <h2>Image queue <span>{items.length}</span></h2>
              <motion.div className="queue-list" layout>
                <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.button layout key={item.id} className={`queue-item ${selectedId === item.id ? 'current' : ''}`} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} whileHover={{ x: 2 }} transition={{ duration: 0.18 }} onClick={() => { setSelectedId(item.id); setEraserActive(false); }}>
                    <img src={item.resultUrl || item.originalUrl} alt="" /><span className="queue-name">{item.name}</span><span className={`queue-status ${item.status}`}>{item.status === 'done' ? 'Ready' : item.status === 'processing' ? '…' : item.status === 'error' ? '!' : 'New'}</span>
                  </motion.button>
                ))}
                </AnimatePresence>
              </motion.div>
              <MotionButton className="queue-run-all" onClick={() => processQueue()}><Sparkles size={15} /> Process all ready images</MotionButton>
            </section>
          )}
          <div className="editor-preview-label">Image Preview</div>
          {selected && <div className="editor-thumb"><img src={selected.resultUrl || selected.originalUrl} alt={`Preview of ${selected.name}`} /><span>{selected.name}</span></div>}
        </aside>

        <section className="editor-canvas-column">
          <div className="editor-canvas-top">
            <div><span className="eyebrow">{selected ? selected.name : 'YOUR IMAGE'}</span><p>{selected?.status === 'done' ? 'Transparent PNG ready to review' : selected ? 'Your original image · remove the background to start' : 'Upload a picture or try the sample handbag'}</p></div>
            {selected?.resultUrl && <span className="transparent-badge"><span /> PNG result</span>}
          </div>
          <motion.div id="editor-preview-canvas" className={`editor-canvas-wrap checkerboard ${tool === 'erase' && eraserActive ? 'eraser-on' : ''}`} layout>
            {!selected ? (
              <div className="editor-empty"><div className="editor-empty-art"><img src="/images/editor-bag-cutout.webp" alt="" /></div><h2>Your image preview</h2><p>Upload an image to make a clean, transparent cutout.</p><Dropzone compact title="Upload your image" subtitle="Drag and drop your image here or browse files" buttonLabel="Browse Files" /><MotionButton className="text-cta sample-button" onClick={loadSample}>Try the portrait sample <ArrowRight size={16} /></MotionButton></div>
            ) : selected.status === 'done' && selected.resultUrl && !selected.edited && tool === 'background' ? (
              <ComparisonSlider before={selected.originalUrl} after={selected.resultUrl} beforeLabel="ORIGINAL" afterLabel="REMOVED" className="editor-comparison" id="review-comparison" />
            ) : tool === 'erase' && eraserActive ? (
              <EraserCanvas key={selected.id} src={sourceForCanvas} brushSize={brushSize} onCommit={(blob) => replaceResult(selected.id, blob)} />
            ) : (
              <motion.div key={`${selected.id}-${tool}-${sourceForCanvas}`} className={`editor-image-stage ${tool === 'colourize' ? 'is-colourizing' : ''}`} initial={{ opacity: 0, scale: 0.985 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.28, ease: 'easeOut' }}><img src={sourceForCanvas} alt={selected.name} style={tool === 'colourize' ? { filter: `hue-rotate(${hue}deg) saturate(1.25)` } : undefined} /><span className="preview-image-name">{selected.status === 'done' ? 'Edited PNG' : 'Original image'}</span></motion.div>
            )}
            <AnimatePresence>{selected?.status === 'processing' && <motion.div className="canvas-processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}><span className="spinner-ring" /><strong>Removing the background…</strong><small>Your image stays on this device</small></motion.div>}</AnimatePresence>
          </motion.div>
          <div className="editor-bottom-bar">
            <div className="editor-bottom-help"><Sparkles size={17} /><span>{tool === 'erase' ? eraserActive ? 'Use the brush to make any area transparent.' : 'Start the brush to erase parts of the image.' : tool === 'colourize' ? 'Preview the hue shift, then Apply to keep it.' : 'Drag the divider to compare your original and transparent result.'}</span></div>
            <MotionButton className="button button-primary download-button" onClick={() => selected && downloadImage(selected.id)} disabled={!selected?.resultUrl}><Download size={19} /> Download Image</MotionButton>
          </div>
        </section>
      </div>

      <Modal open={Boolean(modal)} onClose={() => setModal('')} title={modal === 'help' ? 'Editor help' : modal === 'upscale' ? 'Upscale' : 'Enhance'}>
        {modal === 'help' ? (
          <><p className="modal-copy">Choose Background Remover and press Start to run the AI locally. After processing, drag the comparison handle to review the cutout. Erase lets you brush pixels to transparency; Colourize applies a hue adjustment.</p><div className="modal-actions"><MotionButton className="button button-primary" onClick={() => setModal('')}>Got it</MotionButton></div></>
        ) : (
          <><p className="modal-copy">This Figma workspace includes an {modal} navigation item, but the PIXCLEAR release focuses on the requested background-removal workflow. That operation is not available here; this control does not claim to modify your image.</p><div className="modal-actions"><MotionButton className="button button-outline" onClick={() => setModal('')}>Close</MotionButton><MotionButton className="button button-primary" onClick={() => { setModal(''); activateTool('background'); }}>Background remover</MotionButton></div></>
        )}
      </Modal>
    </main>
  );
}

function EraserCanvas({ src, brushSize, onCommit }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const dirty = useRef(false);
  const [keyboardCursor, setKeyboardCursor] = useState({ x: 0.5, y: 0.5 });

  const point = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (event.clientX - rect.left) * scaleX, y: (event.clientY - rect.top) * scaleY, scaleX, scaleY };
  };

  const commit = () => {
    if (!dirty.current) return;
    dirty.current = false;
    canvasRef.current.toBlob((blob) => { if (blob) onCommit(blob); }, 'image/png');
  };

  useEffect(() => {
    let active = true;
    const canvas = canvasRef.current;
    const image = new Image();
    image.onload = () => {
      if (!active) return;
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      canvas.getContext('2d').drawImage(image, 0, 0);
      setKeyboardCursor({ x: 0.5, y: 0.5 });
    };
    image.onerror = () => {};
    image.src = src;
    return () => { active = false; };
  }, [src]);

  const start = (event) => {
    const canvas = canvasRef.current;
    canvas.setPointerCapture(event.pointerId);
    const context = canvas.getContext('2d');
    const p = point(event);
    setKeyboardCursor({ x: (event.clientX - canvas.getBoundingClientRect().left) / canvas.getBoundingClientRect().width, y: (event.clientY - canvas.getBoundingClientRect().top) / canvas.getBoundingClientRect().height });
    context.globalCompositeOperation = 'destination-out';
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = brushSize * (p.scaleX + p.scaleY) / 2;
    context.beginPath();
    context.moveTo(p.x, p.y);
    context.lineTo(p.x + 0.01, p.y + 0.01);
    context.stroke();
    drawing.current = true;
    dirty.current = true;
  };

  const move = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const fractionX = (event.clientX - rect.left) / rect.width;
    const fractionY = (event.clientY - rect.top) / rect.height;
    if (!drawing.current) {
      setKeyboardCursor({ x: Math.max(0, Math.min(1, fractionX)), y: Math.max(0, Math.min(1, fractionY)) });
      return;
    }
    const p = point(event);
    const context = canvas.getContext('2d');
    context.lineWidth = brushSize * (p.scaleX + p.scaleY) / 2;
    context.lineTo(p.x, p.y);
    context.stroke();
  };

  const finish = () => {
    if (!drawing.current) return;
    drawing.current = false;
    commit();
  };

  const moveKeyboardBrushOrErase = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      const stepX = brushSize / Math.max(1, rect.width);
      const stepY = brushSize / Math.max(1, rect.height);
      const dx = event.key === 'ArrowLeft' ? -stepX : event.key === 'ArrowRight' ? stepX : 0;
      const dy = event.key === 'ArrowUp' ? -stepY : event.key === 'ArrowDown' ? stepY : 0;
      setKeyboardCursor((current) => ({ x: Math.max(0, Math.min(1, current.x + dx)), y: Math.max(0, Math.min(1, current.y + dy)) }));
      return;
    }
    if (event.key !== ' ' && event.key !== 'Enter') return;
    event.preventDefault();
    const context = canvas.getContext('2d');
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    context.save();
    context.globalCompositeOperation = 'destination-out';
    context.beginPath();
    context.arc(keyboardCursor.x * canvas.width, keyboardCursor.y * canvas.height, (brushSize * (scaleX + scaleY) / 2) / 2, 0, Math.PI * 2);
    context.fill();
    context.restore();
    dirty.current = true;
    commit();
  };

  return (
    <div className="eraser-canvas-stage">
      <div className="eraser-canvas-holder">
        <canvas
          ref={canvasRef}
          role="group"
          tabIndex={0}
          aria-label="Editable image. Use the arrow keys to move the eraser and Space or Enter to erase at its position."
          aria-describedby="eraser-keyboard-help"
          onKeyDown={moveKeyboardBrushOrErase}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={finish}
          onPointerCancel={finish}
        />
        <span className="eraser-key-cursor" style={{ left: `${keyboardCursor.x * 100}%`, top: `${keyboardCursor.y * 100}%`, width: `${brushSize}px`, height: `${brushSize}px` }} aria-hidden="true" />
      </div>
      <p className="eraser-keyboard-help" id="eraser-keyboard-help">Keyboard: arrow keys move the brush; Space or Enter erases.</p>
    </div>
  );
}
