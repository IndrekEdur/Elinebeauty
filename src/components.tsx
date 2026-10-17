import { useEffect, useRef, useState, type ReactNode } from 'react';
import { brand, site } from './content';

export function Monogram() {
  return <svg viewBox="0 0 100 110" className="monogram" aria-hidden="true">
    <path fill="currentColor" d="M42 30H88L90 47H88C84 34 79 32 63 32H57V65H64C76 65 78 62 80 54H82V79H80C78 69 75 67 64 67H57V100H65C80 100 86 94 92 82H94L89 102H40V100L47 98V34L42 32Z" />
    <path d="M22 105C43 88 27 58 42 25" fill="none" stroke="currentColor" strokeWidth="1.4" />
    <path fill="currentColor" d="M35 81C20 78 16 68 13 59C27 64 34 71 35 81ZM33 65C20 58 20 48 20 41C30 49 34 55 33 65ZM36 46C27 37 29 26 32 19C38 29 39 37 36 46ZM41 30C37 19 41 9 47 3C47 14 46 23 41 30ZM40 34C43 21 54 18 63 15C58 25 51 31 40 34ZM35 57C40 43 53 41 62 39C54 50 45 55 35 57ZM35 78C40 66 49 64 59 63C53 72 45 77 35 78ZM32 94C27 85 18 84 12 83C17 91 23 95 32 94Z" />
  </svg>;
}

export function Wordmark() {
  return <a className="wordmark" href="#avaleht" aria-label={`${brand.fullName} avaleht`}>{brand.name}<span>{brand.descriptor}</span></a>;
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
