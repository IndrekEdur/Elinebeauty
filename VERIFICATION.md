# TASK-002 kontroll

Kontrollitud 17.10.2026. SFTP on asendatud explicit FTPS-iga; veebilehe lähtefaile ja kujundust ei muudetud.

- Puhas `npm ci`: läbitud; audit raporteeris 0 haavatavust. Esimene katse kohtas ajutist Windowsi faililukku; kordus õnnestus.
- `npm run check` ja `npm run build`: läbitud.
- `npm test`: 23 võrguühenduseta testi. Kaetud puuduv konfiguratsioon, avaldamislukk, eraldi lugemisluba, FTP sihttee kinnitus, TLS-sertifikaadi/hostinime kontroll, PROT P, TLS sessiooni taaskasutus, kirjutamiskäskude blokeerimine kontrollis, varukoopia ning index.html viimasena üleslaadimine.
- Vale siht-PWD, ümber suunatud ressursikataloog, puuduv varukoopia või pärast varundust muutunud serveri index.html peatavad üleslaadimise.
- Testid kontrollivad, et vigase sertifikaadi korral parooli ei saadeta ning protokolli toorveateated ei leki logidesse.
- `git diff -- src public index.html package-lock.json`: tühi; rakenduse kujunduse ja sõltuvuste muudatusi pole.

Päris FTPS ühendust ei tehtud, porti ega `/htdocs/` teed ei kinnitatud ning varukoopiat serverist ei laaditud. Varem vestluses jagatud parooli ei kasutatud. GitHubi Secrets/Variables, production-kaitseid ja avaldamislukku ei muudetud. Omaniku järgmised sammud on README-s.

# TASK-001 varasem kontroll

Kontrollitud 17.10.2026 kohalikus Windowsi keskkonnas.

- Sõltuvuste paigaldus: õnnestus; npm audit raporteeris 0 haavatavust.
- `npm run check`: läbitud, TypeScripti vead puuduvad.
- `npm test`: 6 testi läbitud (puuduv seadistus, avaldamislukk, kinnitamata/ebaturvaline veebijuur, hosti/kasutaja/pordi kontroll).
- `npm run build`: läbitud; staatiline HTML, CSS, JS, fotod ja fondid `dist/` kaustas.
- Eelrenderdatud HTML sisaldab põhisisu ka enne JavaScripti käivitamist.
- Edge/Chromium brauserikontroll: 1440×1000, 768×1024, 390×844 ja 320×760.
- Kontrollitud horisontaalse ülevoolu puudumist, piltide laadimist, broneerimisteadet, Escape'iga sulgemist, hinnakirja kategooriaid, suurendatavat galeriid, keelatud kontaktvormi ja mobiilimenüüd.
- Brauseri JavaScripti erindeid ei esinenud; reduced-motion eelistus keelab sujuva kerimise.
- Arvuti- ja telefonivaate kuvatõmmised vaadati visuaalselt üle.

Zone'i ühendust ega päris avaldamist ei proovitud. Production environment, serveri võtmed, ligipääs, veebijuur, päris sisu ja avaldamise kinnitus jäävad omaniku seadistada. Eri brauserimootorite (Safari/Firefox) ja füüsiliste seadmete kontroll jääb enne avaldamist teha. Kohalik brauserikontroll kasutas keskkonna olemasolevat Playwrighti ja Edge'i; need ei ole rakenduse sõltuvused.
