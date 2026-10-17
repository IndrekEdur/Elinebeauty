import { useState } from 'react';
import { Arrow, BookingButton, Header, Modal, Photo, SectionHeading } from './components';
import { gallery, services, site, specialists } from './content';

export default function App() {
  const [booking, setBooking] = useState(false);
  const [photo, setPhoto] = useState<number | null>(null);
  const [category, setCategory] = useState(services[0].id);
  const selected = services.find(service => service.id === category)!;
  return <>
    <a className="skip-link" href="#sisu">Liigu põhisisu juurde</a>
    <div className="preview-note">ESMANE KAVAND <span>·</span> Näidissisu ja illustratiivsed fotod</div>
    <Header onBooking={() => setBooking(true)} />
    <main id="sisu">
      <section className="hero" id="avaleht" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span className="small-line" /> ILUSALONG JA ESTEETILINE KLIINIK</p>
          <h1 id="hero-title">Ilu algab<br /><em>enesetundest</em></h1>
          <p className="hero-description">Hetk, mis kuulub sulle. Hoolitsused, mis toovad esile sinu loomuliku ilu ja hea enesetunde.</p>
          <div className="hero-actions"><BookingButton onClick={() => setBooking(true)} /><a className="text-link" href="#teenused">Tutvu teenustega <Arrow /></a></div>
          <div className="hero-bottom"><span className="seal" aria-hidden="true">e.</span><p>SINU ILU. SINU RÜTM.<br /><span>Meie juures on aega sinu jaoks.</span></p></div>
        </div>
        <div className="hero-visual"><Photo src="/images/hero.jpg" alt="Rahulik iluportree — Eline Beauty meeleolu illustreeriv näidisfoto" eager /><span className="image-note">LOOMULIKULT SINA</span><span className="hero-index">01 / ELINE BEAUTY</span></div>
      </section>
      <div className="values-strip" aria-label="Meie väärtused"><span>Personaalne lähenemine</span><i aria-hidden="true">✧</i><span>Loomulik ilu</span><i aria-hidden="true">✧</i><span>Teadlik hoolitsus</span><i aria-hidden="true">✧</i><span>Aeg iseendale</span></div>

      <section className="section" id="teenused">
        <SectionHeading eyebrow="01 / MEIE TEENUSED" title={<>Hoolitsus, mis lähtub <em>sinust.</em></>}>Igapäevasest ilurituaalist erilise hetkeni. Leia enda jaoks sobiv hoolitsus.</SectionHeading>
        <div className="services-grid">{services.map(service => <article className="service-card" key={service.id}>
          <a href="#hinnakiri" onClick={() => setCategory(service.id)} aria-label={`${service.title} — vaata hinnakirja`}><div className="service-photo"><Photo src={service.image} alt={service.alt} /><span className="circle-arrow"><Arrow /></span></div><div className="service-title"><span>{service.number}</span><h3>{service.title}</h3></div></a><p>{service.description}</p>
        </article>)}</div>
        <p className="content-note">Teenuste valik on näidis ja täpsustub enne avamist. Esteetilise meditsiini teenused eeldavad sobivuse hindamist kvalifitseeritud spetsialisti poolt.</p>
      </section>

      <section className="about section" id="meist">
        <div className="about-image"><Photo src="/images/interior.jpg" alt="Valgusküllane rahulik interjöör — illustratiivne näidisfoto, mitte salongi tegelik ruum" /><span className="photo-caption">MEELEOLUFOTO / MEIE TULEVASE LOO ALGUS</span></div>
        <div className="about-copy"><p className="eyebrow">02 / ELINE BEAUTY LUGU</p><h2>Rohkem kui ilu.<br /><em>Hea tunne.</em></h2><p>Usume, et ilu algab hetkest, mil tunned end hästi. Eline Beauty veebilehe esialgne kontseptsioon ühendab rahuliku keskkonna, personaalse tähelepanu ja teadlikud valikud.</p><p>Meie filosoofia keskmes on sinu eripära. Kvaliteet tähendab läbimõeldud hoolitsust ning professionaalsus selget ja ausat nõu.</p><p className="content-note">Tutvustuse kavand. Salongi tegelik lugu, tööpõhimõtted ja kvalifikatsioonid lisatakse pärast kinnitamist.</p><a className="text-link" href="#spetsialistid">Tutvu meie inimestega <Arrow /></a></div>
      </section>

      <section className="section team-section" id="spetsialistid">
        <SectionHeading eyebrow="03 / MEIE INIMESED" title={<>Ilu taga on <em>inimesed.</em></>}>Siia tulevad inimesed, kelle oskused ja tähelepanu loovad sinu kogemuse.</SectionHeading>
        <div className="team-grid">{specialists.map((person, index) => <article className="team-card" key={index}><div className="team-photo"><Photo src={person.image} alt={`${person.role} foto kohatäitja — illustratiivne portree`} /><span className="placeholder-label">NÄIDISPROFIIL</span></div><h3>{person.name}</h3><p className="role">{person.role}</p><p>{person.text}</p></article>)}</div>
      </section>

      <section className="prices-section" id="hinnakiri"><div className="section">
        <SectionHeading eyebrow="04 / HINNAKIRI" title={<>Sinu järgmine <em>iluhetk.</em></>}>Vali kategooria ja tutvu hoolitsustega. Kinnitatud hinnakiri lisandub peagi.</SectionHeading>
        <div className="prices-layout"><div className="price-categories" role="group" aria-label="Hinnakirja kategooria">{services.map(service => <button key={service.id} aria-pressed={category === service.id} onClick={() => setCategory(service.id)}>{service.title}<span aria-hidden="true">↗</span></button>)}</div>
        <div className="price-panel" aria-live="polite"><h3>{selected.title}</h3>{selected.items.map(item => <div className="price-row" key={item}><span>{item}</span><span>Täpsustamisel</span></div>)}<p className="content-note">Näidisteenused · hinnad ei ole veel kinnitatud.</p></div></div>
      </div></section>

      <section className="section gallery-section" id="galerii">
        <SectionHeading eyebrow="05 / MEELEOLU" title={<>Väikesed hetked. <em>Suur tunne.</em></>}>Pilguheit meie visuaalsesse maailma. Fotod on illustratiivsed, päris salongigalerii lisandub hiljem.</SectionHeading>
        <div className="gallery-grid">{gallery.map((item, index) => <button className="gallery-item" key={item.src} onClick={() => setPhoto(index)} aria-label={`Suurenda pilti: ${item.alt}`}><Photo src={item.src} alt={item.alt} /><span>{item.label}<span aria-hidden="true">＋</span></span></button>)}</div>
      </section>

      <section className="booking-banner"><p className="eyebrow">HETK ISEENDALE</p><h2>Sinu aeg. <em>Sinu ilu.</em></h2><p>Anna endale aega peatuda ja enda eest hoolitseda.</p><BookingButton onClick={() => setBooking(true)} className="button-light" /><p className="booking-status">Veebibroneerimine ei ole veel avatud.</p></section>

      <section className="section contact-section" id="kontakt"><SectionHeading eyebrow="06 / VÕTA ÜHENDUST" title={<>Kohtume <em>Eline Beautys.</em></>} />
        <div className="contact-grid"><div><dl className="contact-details"><div><dt>KÜLASTA MEID</dt><dd>{site.address ?? 'Aadress lisamisel'}</dd></div><div><dt>HELISTA</dt><dd>{site.phone ? <a href={`tel:${site.phone.replace(/\s/g, '')}`}>{site.phone}</a> : 'Telefon lisamisel'}</dd></div><div><dt>KIRJUTA</dt><dd>{site.email ? <a href={`mailto:${site.email}`}>{site.email}</a> : 'E-posti aadress lisamisel'}</dd></div></dl>
          {site.mapsEmbedUrl?.startsWith('https://www.google.com/maps/embed?') ? <iframe title="Eline Beauty asukoht kaardil" src={site.mapsEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="map-frame" /> : <div className="map-placeholder"><span aria-hidden="true">⌖</span><strong>Peagi kohtume siin</strong><p>Asukoht ja kaart lisatakse pärast aadressi kinnitamist.</p></div>}</div>
          <form className="contact-form" onSubmit={event => event.preventDefault()} aria-describedby="form-status"><h3>Jäta meile mõte</h3><p id="form-status">Kontaktvormi eelvaade. Andmeid ei saadeta ega salvestata. Vorm avaneb pärast ühenduse seadistamist.</p><fieldset disabled><legend className="sr-only">Kontaktvormi näidis</legend><label>Sinu nimi<input name="name" placeholder="Ees- ja perekonnanimi" autoComplete="name" /></label><label>E-post<input type="email" name="email" placeholder="Sinu e-posti aadress" autoComplete="email" /></label><label>Sõnum<textarea name="message" rows={3} placeholder="Kuidas saame sind aidata?" /></label><button className="button" type="submit">Saatmine pole veel avatud <Arrow /></button></fieldset></form>
        </div>
      </section>
    </main>
    <footer className="footer"><a className="wordmark" href="#avaleht">ELINE<span>BEAUTY</span></a><p>Ilu algab enesetundest.</p><a href="#avaleht" className="text-link">Tagasi üles ↑</a><div className="footer-bottom"><span>© {new Date().getFullYear()} Eline Beauty</span><span>Veebilehe esimene kavand · kinnitamata näidissisu</span></div></footer>
    {booking && <Modal title="Sinu iluhetk on peagi siin" onClose={() => setBooking(false)}><p>Veebibroneerimine ei ole veel avatud. Broneerimisvõimalus ja kinnitatud kontaktandmed lisanduvad peagi.</p><p>Praegu ei saa selle lehe kaudu aega broneerida.</p><button className="button" onClick={() => setBooking(false)}>Selge</button></Modal>}
    {photo !== null && <Modal title={gallery[photo].label} onClose={() => setPhoto(null)}><Photo className="lightbox-image" src={gallery[photo].src} alt={gallery[photo].alt} eager /><p className="content-note">Illustratiivne näidisfoto, mitte Eline Beauty salongi tegelik foto.</p></Modal>}
  </>;
}
