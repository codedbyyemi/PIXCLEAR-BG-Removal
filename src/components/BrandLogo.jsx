import MotionLink from './MotionLink';

export default function BrandLogo({ light = false, size = 'normal', to = '/' }) {
  return (
    <MotionLink to={to} className={`brand-logo ${light ? 'brand-logo-light' : ''} brand-logo-${size}`} aria-label="PIXCLEAR home">
      <span>pixclear<span className="brand-dot">.</span></span>
      <svg className="brand-star" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M7 12c9 1 18-1 31-9l-5 15 11 11-16 1-8 14-4-16-15-4 12-5z" />
        <path d="M9 8c9 0 21-3 30-8" />
      </svg>
    </MotionLink>
  );
}
