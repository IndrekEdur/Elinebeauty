import { useState, type FormEvent } from 'react';
import { invitation as event, submitRsvp } from './content';

function Wordmark() {
  return <a className="invite-wordmark" href="/" aria-label="Eline Beauty avaleht">ELINE<span>BEAUTY</span></a>;
}

function RsvpForm() {
  const [attending, setAttending] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setStatus('');
    try {
      await submitRsvp({ name: String(data.get('name')).trim(), attending: attending === 'yes', plusOne: attending === 'yes' && data.get('plusOne') === 'yes' });
      setStatus('Demovormi proovimine õnnestus. Vastust ei saadetud ega salvestatud. Osalemise kinnitamine avaneb peagi.');
    } catch {
      setStatus('Vastuse töötlemine ebaõnnestus. Palun proovi uuesti.');
    } finally { setBusy(false); }
  }
  return <form onSubmit={submit} aria-describedby="rsvp-note">
    <p id="rsvp-note" className="invite-note">Demovorm · vastuseid veel ei saadeta ega salvestata.</p>
    <label className="invite-name" htmlFor="guest-name">Sinu nimi<input id="guest-name" name="name" autoComplete="name" required maxLength={120} pattern=".*\S.*" placeholder="Ees- ja perekonnanimi" /></label>
    <fieldset><legend>Kas tuled meiega tähistama?</legend><div className="invite-options">{[['yes', 'Jah, tulen'], ['no', 'Kahjuks ei saa']].map(([value, label]) => <label key={value}><input type="radio" name="attending" value={value} required checked={attending === value} onChange={() => { setAttending(value); setStatus(''); }} /><span>{label}</span></label>)}</div></fieldset>
    <fieldset disabled={attending !== 'yes'}><legend>Kas võtad kaaslase kaasa?</legend><div className="invite-options">{[['yes', 'Jah, koos kaaslasega'], ['no', 'Tulen üksi']].map(([value, label]) => <label key={value}><input type="radio" name="plusOne" value={value} required={attending === 'yes'} /><span>{label}</span></label>)}</div></fieldset>
    <button className="invite-button" type="submit" disabled={busy}>{busy ? 'Töötlen…' : 'Proovi vastuse saatmist'}<span aria-hidden="true">↗</span></button>
    <p role="status" className="invite-status">{status}</p>
    <noscript>Vormi proovimiseks luba JavaScript. Osalemise kinnitamine pole veel avatud.</noscript>
  </form>;
}

export default function Invitation() {
  return <div className="invitation">
    <a className="invite-skip" href="#kutse-sisu">Liigu kutse juurde</a>
    <header className="invite-header"><Wordmark /><a className="invite-link" href="#rsvp">Vasta kutsele <span aria-hidden="true">↗</span></a></header>
    <main id="kutse-sisu">
      <section className="invite-hero" aria-labelledby="invite-title">
        <div className="invite-hero-copy"><p className="invite-kicker">ELINE BEAUTY · AVAMISPIDU</p><h1 id="invite-title">Üks ilus<br /><em>algus.</em></h1><p className="invite-lead">Mõned hetked väärivad tähistamist.<br />Ja mõned algused sinu kohalolu.</p><a className="invite-button" href="#rsvp">Oled südamest oodatud <span aria-hidden="true">↗</span></a><p className="invite-hero-foot">KUTSE SINULE <span aria-hidden="true">—</span> TATARI 25, TALLINN</p></div>
        <figure className="invite-portrait"><img src="/images/hero.jpg" alt="Pehmes valguses iluportree — illustratiivne meeleolufoto" fetchPriority="high" width="900" height="1200" /><span className="invite-photo-label">ILU. HETK. UUS ALGUS.</span><figcaption>Illustratiivne meeleolufoto</figcaption><span className="invite-seal" aria-hidden="true">e.</span></figure>
      </section>
      <section className="invite-facts" aria-label="Peo toimumise info"><div><p className="invite-kicker">KUUPÄEV</p><p>{event.date}</p></div><div><p className="invite-kicker">KELLAAEG</p><p>{event.time}</p></div><div><p className="invite-kicker">KOHTUME</p><p>{event.address}</p></div></section>
      <section className="invite-letter" aria-labelledby="letter-title"><span className="invite-spark" aria-hidden="true">✳</span><p className="invite-kicker">UUE PEATÜKI ALGUSES</p><h2 id="letter-title">Ilu on veel ilusam,<br />kui seda <em>jagada.</em></h2><p>Ootame sind Eline Beauty avamispeole, et tähistada koos ühe ilusa unistuse algust. Õhtu, kus on ruumi kohtumistele, headele soovidele ja lihtsalt koos olemisele.</p><p>Tule ja jaga meiega seda erilist hetke.<br />Sinu kohalolu muudab selle veel kaunimaks.</p><p className="invite-signature">Soojusega, Eline Beauty</p></section>
      <section className="invite-programme invite-section" aria-labelledby="programme-title"><div><p className="invite-kicker">ÕHTU RÜTM</p><h2 id="programme-title">Hetked, mida<br /><em>jagame.</em></h2><p className="invite-muted">Õhtu täpne ajakava on veel kujunemas.</p></div><ol>{event.programme.map((item, i) => <li key={item.title}><span className="invite-number">0{i + 1}</span><div><p className="invite-kicker">{item.time}</p><h3>{item.title}</h3><p>{item.description}</p></div></li>)}</ol></section>
      <section className="invite-dress" aria-labelledby="dress-title"><p className="invite-kicker">DRESS CODE</p><h2 id="dress-title">Tunne end <em>kaunilt.</em></h2><p>{event.dressCode}</p><span aria-hidden="true">✧</span></section>
      <section id="rsvp" className="invite-rsvp invite-section" aria-labelledby="rsvp-title"><div><p className="invite-kicker">RSVP</p><h2 id="rsvp-title">Kas näeme<br /><em>peol?</em></h2><p className="invite-muted">Ootame sind. Osalemise kinnitamise võimaluse lisame peagi.</p><p className="invite-rsvp-address">ELINE BEAUTY<br />{event.address}</p></div><RsvpForm /></section>
    </main>
    <footer className="invite-footer"><div><Wordmark /><p>Ilusate kohtumisteni.</p></div><div><p className="invite-kicker">HOIAME ÜHENDUST</p>{event.instagramUrl ? <a className="invite-link" href={event.instagramUrl} target="_blank" rel="noopener noreferrer">Instagram ↗</a> : <p className="invite-note">Instagrami link lisandub peagi.</p>}{event.email ? <a className="invite-link" href={`mailto:${event.email}`}>{event.email}</a> : <p className="invite-note">Kontaktandmed täpsustamisel.</p>}<a className="invite-link" href="/">Eline Beauty avaleht ↗</a></div><p className="invite-footer-bottom">ELINE BEAUTY <span>ÜKS ILUS ALGUS.</span></p></footer>
  </div>;
}
