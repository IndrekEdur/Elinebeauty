# TASK-001 kontroll

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
