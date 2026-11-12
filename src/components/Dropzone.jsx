import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ImagePlus, UploadCloud } from 'lucide-react';
import { usePixclear } from '../App';

export default function Dropzone({ title = 'Upload your image', subtitle = 'Drag and drop your image here or browse files', compact = false, buttonLabel = 'Browse Files' }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const { addFiles, notice, setNotice } = usePixclear();

  const pickFiles = (files) => {
    setNotice('');
    addFiles(files);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <motion.div
      className={`dropzone ${compact ? 'dropzone-compact' : ''} ${dragging ? 'dropzone-active' : ''}`}
      onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
      onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false); }}
      onDrop={(event) => { event.preventDefault(); setDragging(false); pickFiles(event.dataTransfer.files); }}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => { if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); inputRef.current?.click(); } }}
      whileHover={{ borderColor: '#6841e8', y: -2 }}
      animate={{ scale: dragging ? 1.008 : 1, borderColor: dragging ? '#6841e8' : undefined }}
      whileTap={{ scale: 0.996 }}
      transition={{ duration: 0.18 }}
      role="group"
      tabIndex={0}
      aria-label="Upload image files"
    >
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" multiple hidden onChange={(event) => pickFiles(event.target.files)} />
      <motion.div className="dropzone-icon" animate={{ scale: dragging ? 1.1 : 1, y: dragging ? -3 : 0 }} transition={{ type: 'spring', stiffness: 380, damping: 20 }}><UploadCloud size={compact ? 40 : 56} strokeWidth={1.65} /></motion.div>
      <strong>{title}</strong>
      <p>{subtitle}</p>
      <motion.button className="button button-primary dropzone-button" type="button" whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={(event) => { event.stopPropagation(); inputRef.current?.click(); }}>
        <ImagePlus size={17} /> {buttonLabel}
      </motion.button>
      <span className="dropzone-hint">PNG, JPG or JPEG · WEBP · Maximum 10MB each</span>
      <AnimatePresence>
        {notice && <motion.div className="upload-error" role="alert" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} onClick={(event) => event.stopPropagation()}>{notice}</motion.div>}
      </AnimatePresence>
    </motion.div>
  );
}
