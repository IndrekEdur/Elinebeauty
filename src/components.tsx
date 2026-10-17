import { useEffect, useRef, useState, type ReactNode } from 'react';
import { brand, site } from './content';

export function BrandLogo({ decorative = false }: { decorative?: boolean }) {
  return <span className="brand-logo"><img src="/images/eline-logo-transparent.svg" alt={decorative ? '' : 'eliné — Beauty · Hair · Aesthetics'} width="1180" height="522" /></span>;
}

export function Monogram() {
  return <span className="monogram" aria-hidden="true"><BrandLogo decorative /></span>;
}

export function Wordmark() {
  return <a className="wordmark" href="#avaleht" aria-label={`${brand.fullName} avaleht`}><BrandLogo /></a>;
}

export function Arrow() {
  return <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" /></svg>;
}

export function Photo({ src, alt, className = '', eager = false }: { src: string; alt: string; className?: string; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  return failed ? <div className={`photo-fallback ${className}`} role="img" aria-label={alt}><span>{brand.fullName}<small>Pilt pole hetkel saadaval</small></span></div>
    : <img className={className} src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} decoding="async" onError={() => setFailed(true)} />;
}

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  return <dialog ref={ref} aria-labelledby="dialog-title" onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="modal-content"><button className="close-button" autoFocus onClick={onClose} aria-label="Sulge aken">×</button><h2 id="dialog-title">{title}</h2>{children}</div>
  </dialog>;
}

export function BookingButton({ onClick, className = '' }: { onClick: () => void; className?: string }) {
  const url = site.bookingUrl?.startsWith('https://') ? site.bookingUrl : null;
  return url ? <a className={`button ${className}`} href={url} target="_blank" rel="noopener noreferrer">Broneeri aeg <Arrow /></a>
    : <button className={`button ${className}`} onClick={onClick}>Broneeri aeg <Arrow /></button>;
}

export function SectionHeading({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return <div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>{children && <p className="section-intro">{children}</p>}</div>;
}

export function Header({ onBooking }: { onBooking: () => void }) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const links = [['Teenused', 'teenused'], ['Meist', 'meist'], ['Spetsialistid', 'spetsialistid'], ['Hinnakiri', 'hinnakiri'], ['Kontakt', 'kontakt']];
  return <header className="header" onKeyDown={e => { if (e.key === 'Escape') { setOpen(false); toggle.current?.focus(); } }}>
    <Wordmark />
    <button ref={toggle} className="menu-toggle" aria-expanded={open} aria-controls="navigation" onClick={() => setOpen(!open)}>{open ? 'Sulge ×' : 'Menüü ☰'}</button>
    <nav id="navigation" className={open ? 'navigation is-open' : 'navigation'} aria-label="Peamenüü">{links.map(([label, id]) => <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>{label}</a>)}</nav>
    <BookingButton className="header-booking" onClick={onBooking} />
  </header>;
}
