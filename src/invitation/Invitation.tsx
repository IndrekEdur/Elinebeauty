import { invitation as event } from './content';

function Wordmark() {
  return <div className="invite-wordmark" role="img" aria-label="eliné beauty">eliné<span>beauty</span></div>;
}

export default function Invitation() {
  return <div className="invitation">
    <a className="invite-skip" href="#kutse-sisu">Liigu kutse juurde</a>
    <header className="invite-header"><Wordmark /></header>
    <main id="kutse-sisu">
      <section className="invite-hero" aria-labelledby="invite-title">
        <div className="invite-hero-copy"><p className="invite-kicker">eliné beauty · AVAMISPIDU</p><h1 id="invite-title">Üks ilus<br /><em>algus.</em></h1><p className="invite-lead">Mõned hetked väärivad tähistamist.<br />Ja mõned algused sinu kohalolu.</p><p className="invite-hero-foot">KUTSE ON PERSONAALNE <span aria-hidden="true">—</span> TATARI 25, TALLINN</p></div>
      </section>
      <section className="invite-facts" aria-label="Peo toimumise info"><div><p className="invite-kicker">KUUPÄEV</p><p>{event.date}</p></div><div><p className="invite-kicker">KELLAAEG</p><p>{event.time}</p></div><div><p className="invite-kicker">KOHTUME</p><p>{event.address}</p></div></section>
      <section className="invite-letter" aria-labelledby="letter-title"><p className="invite-kicker">UUE PEATÜKI ALGUSES</p><h2 id="letter-title">Ilu on veel ilusam,<br />kui seda <em>jagada.</em></h2><p>Ootame sind eliné beauty avamispeole, et tähistada koos ühe ilusa unistuse algust. Õhtu, kus on ruumi kohtumistele, headele soovidele ja lihtsalt koos olemisele.</p><p>Tule ja jaga meiega seda erilist hetke.<br />Sinu kohalolu muudab selle veel kaunimaks.</p><p>{event.productNote}</p><p className="invite-gift">{event.giftNote}</p><p className="invite-signature">Soojusega, eliné beauty</p></section>
    </main>
    <footer className="invite-footer"><div><Wordmark /><p>Ilusate kohtumisteni.</p></div><div><p className="invite-kicker">HOIAME ÜHENDUST</p>{event.instagramUrl ? <a className="invite-link" href={event.instagramUrl} target="_blank" rel="noopener noreferrer">Instagram ↗</a> : <p className="invite-note">Instagrami link lisandub peagi.</p>}{event.email ? <a className="invite-link" href={`mailto:${event.email}`}>{event.email}</a> : <p className="invite-note">Kontaktandmed täpsustamisel.</p>}<a className="invite-link" href={`tel:${event.phone}`}>{event.phoneLabel}</a></div><p className="invite-footer-bottom">eliné beauty <span>ÜKS ILUS ALGUS.</span></p></footer>
  </div>;
}
