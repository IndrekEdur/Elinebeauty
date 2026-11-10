import { useState, type FormEvent } from 'react';
import { invitation as event, submitRsvp } from './content';

function Wordmark() {
  return <div className="invite-wordmark" role="img" aria-label="eliné beauty">eliné<span>beauty</span></div>;
}

function RsvpForm() {
  const [attending, setAttending] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setStatus('');
    try {
      await submitRsvp({ name: String(data.get('name')).trim(), attending: attending === 'yes', plusOne: attending === 'yes' && data.get('plusOne') === 'yes' }, String(data.get('website') ?? ''));
      setStatus('Aitäh! Sinu vastus on saadetud.');
    } catch (error) {
      setStatus(error instanceof Error && error.name !== 'TimeoutError' ? error.message : 'Saatmine katkes. Kui vastus ei jõudnud kohale, proovi uuesti või kirjuta info@elinebeauty.ee.');
    } finally { setBusy(false); }
  }
  return <form onSubmit={submit} method="post" action="/kutse/rsvp.php" aria-describedby="rsvp-note" aria-busy={busy}>
    <p id="rsvp-note" className="invite-note">Sinu nimi ja osalemise valikud saadetakse salongile eliné beauty aadressil info@elinebeauty.ee ainult avamispeo korraldamiseks.</p>
    <div className="invite-honeypot" aria-hidden="true"><label>Veebileht<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <label className="invite-name" htmlFor="guest-name">Sinu nimi<input id="guest-name" name="name" autoComplete="name" required maxLength={120} pattern=".*\S.*" placeholder="Ees- ja perekonnanimi" /></label>
    <fieldset><legend>Kas tuled meiega tähistama?</legend><div className="invite-options">{[['yes', 'Jah, tulen'], ['no', 'Kahjuks ei saa']].map(([value, label]) => <label key={value}><input type="radio" name="attending" value={value} required checked={attending === value} onChange={() => { setAttending(value); setStatus(''); }} /><span>{label}</span></label>)}</div></fieldset>
    <fieldset disabled={attending !== 'yes'}><legend>Kas võtad kaaslase kaasa?</legend><div className="invite-options">{[['yes', 'Jah, koos kaaslasega'], ['no', 'Tulen üksi']].map(([value, label]) => <label key={value}><input type="radio" name="plusOne" value={value} required={attending === 'yes'} /><span>{label}</span></label>)}</div></fieldset>
    <button className="invite-button" type="submit" disabled={busy}>{busy ? 'Töötlen…' : 'Saada vastus'}<span aria-hidden="true">↗</span></button>
    <p role="status" className="invite-status">{status}</p>
    <noscript>Vastamiseks luba JavaScript või kirjuta info@elinebeauty.ee.</noscript>
  </form>;
}

export default function Invitation() {
  return <div className="invitation">
    <a className="invite-skip" href="#kutse-sisu">Liigu kutse juurde</a>
    <header className="invite-header"><Wordmark /><a className="invite-link" href="#rsvp">Vasta kutsele <span aria-hidden="true">↗</span></a></header>
    <main id="kutse-sisu">
      <section className="invite-hero" aria-labelledby="invite-title">
        <div className="invite-hero-copy"><p className="invite-kicker">eliné beauty · AVAMISPIDU</p><h1 id="invite-title">Üks ilus<br /><em>algus.</em></h1><p className="invite-lead">Mõned hetked väärivad tähistamist.<br />Ja mõned algused sinu kohalolu.</p><a className="invite-button" href="#rsvp">Oled südamest oodatud <span aria-hidden="true">↗</span></a><p className="invite-hero-foot">KUTSE SINULE <span aria-hidden="true">—</span> TATARI 25, TALLINN</p></div>
      </section>
      <section className="invite-facts" aria-label="Peo toimumise info"><div><p className="invite-kicker">KUUPÄEV</p><p>{event.date}</p></div><div><p className="invite-kicker">KELLAAEG</p><p>{event.time}</p></div><div><p className="invite-kicker">KOHTUME</p><p>{event.address}</p></div></section>
      <section className="invite-letter" aria-labelledby="letter-title"><p className="invite-kicker">UUE PEATÜKI ALGUSES</p><h2 id="letter-title">Ilu on veel ilusam,<br />kui seda <em>jagada.</em></h2><p>Ootame sind eliné beauty avamispeole, et tähistada koos ühe ilusa unistuse algust. Õhtu, kus on ruumi kohtumistele, headele soovidele ja lihtsalt koos olemisele.</p><p>Tule ja jaga meiega seda erilist hetke.<br />Sinu kohalolu muudab selle veel kaunimaks.</p><p>{event.productNote}</p><p className="invite-gift">{event.giftNote}</p><p className="invite-signature">Soojusega, eliné beauty</p></section>
      <section id="rsvp" className="invite-rsvp invite-section" aria-labelledby="rsvp-title"><div><p className="invite-kicker">RSVP</p><h2 id="rsvp-title">Kas näeme<br /><em>peol?</em></h2><p className="invite-muted">Anna meile teada, kas saad meiega tähistama tulla.</p><p className="invite-rsvp-address">eliné beauty<br />{event.address}</p></div><RsvpForm /></section>
    </main>
    <footer className="invite-footer"><div><Wordmark /><p>Ilusate kohtumisteni.</p></div><div><p className="invite-kicker">HOIAME ÜHENDUST</p>{event.instagramUrl ? <a className="invite-link" href={event.instagramUrl} target="_blank" rel="noopener noreferrer">Instagram ↗</a> : <p className="invite-note">Instagrami link lisandub peagi.</p>}{event.email ? <a className="invite-link" href={`mailto:${event.email}`}>{event.email}</a> : <p className="invite-note">Kontaktandmed täpsustamisel.</p>}<a className="invite-link" href={`tel:${event.phone}`}>{event.phoneLabel}</a></div><p className="invite-footer-bottom">eliné beauty <span>ÜKS ILUS ALGUS.</span></p></footer>
  </div>;
}
