import { useEffect, useRef, useState, type ReactNode } from 'react';
import { brand, site } from './content';

export function Monogram() {
  return <svg viewBox="0 0 100 100" className="monogram" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1" /><text x="43" y="75" fontFamily="Cormorant Garamond, Georgia, serif" fontSize="74" fill="currentColor">E</text><path d="M29 78 Q20 51 37 22" fill="none" stroke="currentColor" strokeWidth="1.5" />{[[28,65,-40],[24,53,-35],[27,40,-30],[33,29,20],[34,56,35],[34,44,40]].map(([x,y,r],i)=><ellipse key={i} cx={x} cy={y} rx="3" ry="9" transform={`rotate(${r} ${x} ${y})`} fill="currentColor" />)}</svg>;
}

export function Wordmark() {
  return <a className="wordmark" href="#avaleht" aria-label={`${brand.fullName} avaleht`}>{brand.name}<span>{brand.descriptor}</span></a>;
}

export function Arrow() {
  return <span aria-hidden="true">↗</span>;
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
