import { useState } from 'react';
import { Arrow, BookingButton, CompanyFooter, Header, HeroSlideshow, Modal, Monogram, Photo, SectionHeading, useScrollReveal } from './components';
import { brand, gallery, services, site, specialists } from './content';

export default function App() {
  useScrollReveal();
  const [booking, setBooking] = useState(false);
  const [motionPaused, setMotionPaused] = useState(false);
  const [photo, setPhoto] = useState<number | null>(null);
  const [category, setCategory] = useState(services[0].id);
  const selected = services.find(service => service.id === category)!;
  return <>
    <a className="skip-link" href="#sisu">Liigu põhisisu juurde</a>
    <div className="preview-note">UUENEV ILUMAAILM <span>·</span> Teenuste info täieneb · ruumipildid on visualiseeringud</div>
    <Header onBooking={() => setBooking(true)} />
    <main id="sisu">
      <section className="hero" id="avaleht" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span className="small-line" /> ILUSALONG JA ESTEETILINE KLIINIK</p>
          <h1 id="hero-title">Ilu algab<br /><em>enesetundest</em></h1>
          <p className="hero-description">Hetk, mis kuulub sulle. Hoolitsused, mis toovad esile sinu loomuliku ilu ja hea enesetunde.</p>
          <div className="hero-actions"><BookingButton onClick={() => setBooking(true)} /><a className="text-link" href="#teenused">Tutvu teenustega <Arrow /></a></div>
          <div className="hero-bottom"><p>SINU ILU. SINU RÜTM.<br /><span>Meie juures on aega sinu jaoks.</span></p></div>
        </div>
        <div className={`hero-visual ${motionPaused ? 'motion-paused' : ''}`}><HeroSlideshow paused={motionPaused} /><div className="hero-image-caption"><span>RUUM SINU ILULE</span><small>Salongi interjööri visualiseering</small></div><span className="hero-index">{brand.descriptor}</span><button className="hero-motion-toggle" onClick={() => setMotionPaused(paused => !paused)} aria-pressed={motionPaused} aria-label="Peata slaidiesitus">{motionPaused ? 'Jätka liikumist' : 'Peata liikumine'}</button></div>
      </section>
      <div className="values-strip" aria-label="Meie väärtused"><span>Personaalne lähenemine</span><i aria-hidden="true">✧</i><span>Loomulik ilu</span><i aria-hidden="true">✧</i><span>Teadlik hoolitsus</span><i aria-hidden="true">✧</i><span>Aeg iseendale</span></div>

      <section className="section" id="teenused">
        <SectionHeading eyebrow="01 / MEIE TEENUSED" title={<>Hoolitsus, mis lähtub <em>sinust.</em></>}>Igapäevasest ilurituaalist erilise hetkeni. Leia enda jaoks sobiv hoolitsus.</SectionHeading>
        <div className="services-grid">{services.map(service => <article className="service-card" key={service.id}>
          <a href="#hinnakiri" onClick={() => setCategory(service.id)} aria-label={`${service.title} — vaata hinnakirja`}><div className="service-photo"><Photo src={service.image} alt={service.alt} />{service.image.includes('-concept') && <span className="service-image-note">VISUALISEERING</span>}<span className="circle-arrow"><Arrow /></span></div><div className="service-title"><span>{service.number}</span><h3>{service.title}</h3></div></a><p>{service.description}</p>
        </article>)}</div>
        <p className="content-note">Teenuste valik on näidis ja täpsustub enne avamist. Esteetilise meditsiini teenused eeldavad sobivuse hindamist kvalifitseeritud spetsialisti poolt.</p>
      </section>

      <section className="about section" id="meist">
        <div className="about-image"><Photo src="/images/salon-plan-concept.jpg" alt="Salongi ruumilahendus — ülaltvaates interjööri visualiseering" className="concept-photo" /><span className="photo-caption">RUUMILAHENDUSE VISUALISEERING</span></div>
        <div className="about-copy"><p className="eyebrow">02 / MEIE ILUMAAILM</p><h2>Rohkem kui ilu.<br /><em>Hea tunne.</em></h2><p>Usume, et ilu algab heast enesetundest. Loomulikud toonid, soe valgus ja ruum iseendale — see on meie ilumaailm.</p><p>Meie filosoofia keskmes on sinu eripära. Kvaliteet tähendab läbimõeldud hoolitsust ning professionaalsus selget ja ausat nõu.</p><p className="content-note">Ruumipildid tutvustavad salongi kujunduskontseptsiooni. Teenuste ja salongi info täieneb.</p><a className="text-link" href="#spetsialistid">Tutvu meie inimestega <Arrow /></a></div>
      </section>

      <section className="section team-section" id="spetsialistid">
        <SectionHeading eyebrow="03 / MEIE INIMESED" title={<>Ilu taga on <em>inimesed.</em></>}>Saame tuttavaks. Erle Edur ja Cristina Land.</SectionHeading>
        <div className="specialists-grid">{specialists.map(person => <article className="specialist-feature" key={person.name}>
          <div className="specialist-portrait"><Photo src={person.image} alt={person.alt} /></div>
          <div className="specialist-copy"><h3>{person.name}</h3><p className="eyebrow">{person.role}</p><p>{person.text}</p><a className="text-link" href="#hinnakiri" onClick={() => setCategory(person.category)}>{person.linkLabel} <Arrow /></a><span className="specialist-signature">Loomulikult sina.</span></div>
        </article>)}</div>
      </section>

      <section className="prices-section" id="hinnakiri"><div className="section">
        <SectionHeading eyebrow="04 / HINNAKIRI" title={<>Sinu järgmine <em>iluhetk.</em></>}>Vali kategooria ja tutvu hoolitsustega. Kinnitatud hinnakiri lisandub peagi.</SectionHeading>
        <div className="prices-layout"><div className="price-categories" role="group" aria-label="Hinnakirja kategooria">{services.map(service => <button key={service.id} aria-pressed={category === service.id} onClick={() => setCategory(service.id)}>{service.title}<Arrow /></button>)}</div>
        <div className="price-panel" aria-live="polite"><h3>{selected.title}</h3>{selected.items.map(item => <div className="price-row" key={item}><span>{item}</span><span>Täpsustamisel</span></div>)}<p className="content-note">Näidisteenused · hinnad ei ole veel kinnitatud.</p></div></div>
      </div></section>

      <section className="section gallery-section" id="galerii">
        <SectionHeading eyebrow="05 / MEELEOLU" title={<>Väikesed hetked. <em>Suur tunne.</em></>}>Oliiviroheline, soe liivatoon ja pehme kuldne valgus. Avasta meie salongi kujunduskontseptsioon.</SectionHeading>
        <div className="gallery-grid">{gallery.map((item, index) => <button className={`gallery-item ${item.concept ? 'is-concept' : ''}`} key={item.src} onClick={() => setPhoto(index)} aria-label={`Suurenda pilti: ${item.alt}`}><Photo src={item.src} alt={item.alt} className={item.concept ? 'concept-photo' : ''} /><span><span>{item.label}{item.concept && <small>VISUALISEERING</small>}</span><span aria-hidden="true">＋</span></span></button>)}</div>
      </section>

      <section className="booking-banner"><Monogram /><p className="eyebrow">HETK ISEENDALE</p><h2>Sinu aeg. <em>Sinu ilu.</em></h2><p>Anna endale aega peatuda ja enda eest hoolitseda.</p><BookingButton onClick={() => setBooking(true)} className="button-light" /><p className="booking-status">Veebibroneerimine ei ole veel avatud.</p></section>

      <section className="section contact-section" id="kontakt"><SectionHeading eyebrow="06 / VÕTA ÜHENDUST" title={<>Võta meiega <em>ühendust.</em></>} />
        <div className="contact-grid"><div><dl className="contact-details"><div><dt>KÜLASTA MEID</dt><dd>{site.address ?? 'Aadress lisamisel'}</dd></div><div><dt>TELEFON</dt><dd>{site.phone ? <a href={`tel:${site.phone.replace(/\s/g, '')}`}>{site.phone}</a> : 'Telefon lisamisel'}</dd></div><div><dt>E-POST</dt><dd>{site.email ? <a href={`mailto:${site.email}`}>{site.email}</a> : 'E-posti aadress lisamisel'}</dd></div></dl>
          {site.mapsEmbedUrl?.startsWith('https://www.google.com/maps?') ? <iframe title="Eline Beauty asukoht kaardil" src={site.mapsEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="map-frame" /> : <div className="map-placeholder"><span aria-hidden="true">⌖</span><strong>Peagi kohtume siin</strong><p>Asukoht ja kaart lisatakse pärast aadressi kinnitamist.</p></div>}
          <div className="arrival-links"><a className="button" href="https://www.google.com/maps/dir/?api=1&destination=Tatari+25%2C+Tallinn" target="_blank" rel="noopener noreferrer">Juhata mind salongi <Arrow /></a><a className="text-link" href="https://maps.apple.com/?daddr=Tatari+25,Tallinn" target="_blank" rel="noopener noreferrer">Ava Apple Mapsis <Arrow /></a></div>
          <div className="parking-info"><span className="parking-symbol" aria-hidden="true">P</span><div><h3>Saabumine ja parkimine</h3><p>Leiad meid aadressilt Tatari 25, Tallinn.</p><p>Parkida saab alloleval pildil märgitud hoovialal. Parkimine on tasuline: järgi parkla infotahvlil olevaid tingimusi ja maksejuhiseid. Vabade kohtade olemasolu ei ole tagatud.</p><a className="text-link" href="https://www.tallinn.ee/et/parkimiskorraldus" target="_blank" rel="noopener noreferrer">Tallinna parkimisinfo <Arrow /></a></div></div><figure className="parking-guide"><a href="/images/tatari-parking-guide.jpg" target="_blank" rel="noopener noreferrer" aria-label="Ava parkimisala juhispilt suurelt"><Photo src="/images/tatari-parking-guide.jpg" alt="Omaniku märgitud parkimisala Tatari 25 lähedal: hooviala on ümbritsetud punase joonega" /></a><figcaption>Parkimisala omaniku juhispildil · klõpsa suurendamiseks. Märgistus on orienteeruv; järgi kohapealset liikluskorraldust.</figcaption></figure>
          </div>
          <form className="contact-form" onSubmit={event => event.preventDefault()} aria-describedby="form-status"><h3>Jäta meile mõte</h3><p id="form-status">Kontaktvormi eelvaade. Andmeid ei saadeta ega salvestata. Vorm avaneb pärast ühenduse seadistamist.</p><fieldset disabled><legend className="sr-only">Kontaktvormi näidis</legend><label>Sinu nimi<input name="name" placeholder="Ees- ja perekonnanimi" autoComplete="name" /></label><label>E-post<input type="email" name="email" placeholder="Sinu e-posti aadress" autoComplete="email" /></label><label>Sõnum<textarea name="message" rows={3} placeholder="Kuidas saame sind aidata?" /></label><button className="button" type="submit">Saatmine pole veel avatud <Arrow /></button></fieldset></form>
        </div>
      </section>
    </main>
    <CompanyFooter />
    {booking && <Modal title="Sinu iluhetk on peagi siin" onClose={() => setBooking(false)}><p>Veebibroneerimine ei ole veel avatud. Broneerimisvõimalus ja kinnitatud kontaktandmed lisanduvad peagi.</p><p>Praegu ei saa selle lehe kaudu aega broneerida.</p><button className="button" onClick={() => setBooking(false)}>Selge</button></Modal>}
    {photo !== null && <Modal title={gallery[photo].label} onClose={() => setPhoto(null)}><Photo className="lightbox-image" src={gallery[photo].src} alt={gallery[photo].alt} eager /><p className="content-note">{gallery[photo].note}</p></Modal>}
  </>;
}
