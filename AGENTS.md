# Eline Beauty arendamine

- Hoia leht eestikeelne ning React + Vite + TypeScript + Tailwind põhine ja staatiliselt avaldatav.
- Sisu: `src/content.ts`; ära mõtle välja hindu, kontakte, kogemusi ega kvalifikatsioone.
- Kontrollid: `npm ci`, `npm run check`, `npm test`, `npm run build`.
- `npm run build` peab sisaldama staatilise HTML-i eelrenderdust.
- Serverisse avaldamine eeldab omaniku kinnitatud Zone seadistust. Ära lülita `ZONE_DEPLOY_ENABLED` sisse ega eemalda sihtkataloogi või hostivõtme kontrolle omal algatusel.
- Deployment ei tohi serveris automaatselt faile kustutada. Hoia võtmed ainult GitHub production secrets'is.
- Säilita ligipääsetavus, klaviatuuriga sulgetavad dialoogid, reduced-motion ja nähtavad mittetoimivate integratsioonide olekud.
