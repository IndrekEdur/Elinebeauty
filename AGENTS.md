# Eline Beauty arendamine

- Hoia leht eestikeelne ning React + Vite + TypeScript + Tailwind põhine ja staatiliselt avaldatav.
- Sisu: `src/content.ts`; ära mõtle välja hindu, kontakte, kogemusi ega kvalifikatsioone.
- Kontrollid: `npm ci`, `npm run check`, `npm test`, `npm run build`.
- `npm run build` peab sisaldama staatilise HTML-i eelrenderdust.
- Serverisse avaldamine eeldab omaniku kinnitatud Zone seadistust. Ära lülita `ZONE_DEPLOY_ENABLED` sisse ega eemalda FTP sihtkataloogi, TLS-sertifikaadi või hostinime kontrolle omal algatusel.
- Kasuta explicit FTPS-i ja TLS-i mõlemal kanalil. Omanik sisestab enda valitud olemasoleva või uue FTP parooli otse production Secretsisse; ära kopeeri parooli vestlusest. Enne ühendust oota omaniku kinnitust, et parool on lisatud. Testid vajavad Python 3.12+ (standardteek).
- Lugemiskontroll vajab eraldi omaniku luba; tavaline PR-i build ei tohi Zone'iga ühendust luua.
- Deployment ei tohi serveris automaatselt faile kustutada. Enne üleslaadimist varunda index.html ja salvesta artefakt; parooli ei tohi logida ega artefakti lisada.
- Säilita ligipääsetavus, klaviatuuriga sulgetavad dialoogid, reduced-motion ja nähtavad mittetoimivate integratsioonide olekud.
