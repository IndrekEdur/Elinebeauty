# ELINE BEAUTY

Eestikeelne, mobiilisõbralik ilusalongi ja esteetilise kliiniku veebilehe esimene versioon. React + Vite + TypeScript + Tailwind CSS. Zone vajab ainult `dist/` staatilisi faile, mitte Node.js serverit. Build eelrenderdab lehe sisu HTML-i; React lisab interaktsioonid. Fondid ja pildid serveeritakse kohalikult.

**Staatus: ülevaatamiseks valmis kavand, päris domeenile avaldamine lukus.** Teenused ja tutvustused on näidissisu; spetsialistid, fotod ja kontaktandmed ei esinda kinnitatud tegelikke andmeid. Hinnad pole välja mõeldud. Broneerimisel kuvatakse teade, vorm on keelatud ja andmeid ei kogu. Analüütikat, jälitusküpsiseid ega välist kaarti pole vaikimisi lisatud.

## Kohalik arendus

Vajalik Node.js 22.12+ (soovitus: Node 22 LTS koos npm-iga) ja Git.

```sh
git clone https://github.com/IndrekEdur/Elinebeauty.git
cd Elinebeauty
npm ci
npm run dev
```

Vite väljastab kohaliku aadressi (tavaliselt `http://127.0.0.1:5173`).

```sh
npm run check   # TypeScript
npm test        # deployment'i turvaväravate testid
npm run build  # TypeScript, optimeeritud failid, staatiline HTML
npm run preview
```

`package-lock.json` lukustab täpsed sõltuvused. Commit'i see koos package.json muudatustega. `dist/`, `node_modules/`, võtmed ja .env failid ei kuulu Giti. Vite `VITE_*` muutujad on avalikud: ära pane neisse saladusi.

## Failid ja sisu muutmine

| Fail | Sisu |
| --- | --- |
| `src/content.ts` | Teenused, hinnakirja näidisread, spetsialistid, galerii, kontaktid, broneerimine |
| `src/App.tsx` | Lehe sektsioonid ja tekstid |
| `src/components.tsx` | Päis, ligipääsetav dialoog, pildid, nupud |
| `src/styles.css` | Värvid, tüpograafia, mobile-first sobitused ja animatsioonid |
| `public/images/` | Kohalikud fotod; päritolu `IMAGE-CREDITS.md` |
| `index.html` | Pealkiri, SEO, Open Graph, kanooniline URL ja struktureeritud andmed |
| `scripts/prerender.tsx` | Staatilise HTML-i loomine pärast Vite build'i |
| `.github/workflows/deploy.yml` | PR-kontrollid ja lukustatud main → Zone avaldamine |

Pildi lisamisel pane fail `public/images/` kausta ning lisa kirje `gallery` massiivi koos sisulise eestikeelse alt-tekstiga. Soovituslik laius 1200–1600 px, optimeeritud WebP/JPEG. Spetsialistide fotod asenda nende loal kasutatavate tegelike fotodega. Näidissildid eemalda alles kinnitatud sisu korral.

`site.bookingUrl` on praegu `null`. Lisa hiljem kontrollitud HTTPS broneerimislink: sama link jõuab kõikidesse broneerimisnuppudesse. Uuenda ka broneerimisala olekuteksti. `site.mapsEmbedUrl` aktsepteerib Google Mapsi `https://www.google.com/maps/embed?...` URL-i. Enne välise kaardi või teenuse lisamist vaata üle privaatsusteave. Kontaktvormi avamiseks tuleb eraldi lisada backend, serveripoolne valideerimine, rämpspostikaitse, privaatsustingimused ning tegelikud saatmise/vea/õnnestumise olekud; praegune vorm ei saada midagi.

## GitHub Actions: ettevalmistus

Push `main` harusse käivitab paigalduse (`npm ci`), TypeScripti, testid ja `npm run build`. Pull request kontrollib sama build'i, kuid **ei avalda**. Valmis `dist/` salvestatakse 7 päevaks Actionsi artefaktina. Töövoogu saab ka käsitsi käivitada `workflow_dispatch` abil main-harult.

Avaldamine on vaikimisi keelatud: repository variable `ZONE_DEPLOY_ENABLED` puudub. Build-logis ilmub vastav teade ja serveriga ei looda ühendust. Kui avaldamine on lubatud, kuid seadistus on puudulik või vale, töö ebaõnnestub enne võrguühendust selge veateatega. Tühja repositooriumi esmane README commit on alus muudatuste PR-ile.

1. Ava GitHubis repositooriumi **Settings → Environments → New environment** ja loo täpselt `production`.
2. Piira deployment branch valikuga ainult `main`.
3. Lülita sisse **Required reviewers** ja lisa sobiv kinnitaja. Vajaduse korral keela administraatori möödapääs. `Prevent self-review` nõuab teist inimest, seega üksi töötades vali reegel teadlikult.
4. Required reviewers'i saadavus sõltub repositooriumi nähtavusest ja GitHubi paketist. Kui seda valikut pole, jäta `ZONE_DEPLOY_ENABLED` välja lülitatuks, kuni sobiv kaitse või pakett on kokku lepitud. YAML üksi ei seadista GitHubi kinnitajaid.
5. Soovitus: kaitse `main` haru, nõua PR-i ja edukat `build` kontrolli; piira õigust muuta töövoogu ja environment'i.

## Zone: SSH/SFTP ja veebijuur

**Seda osa teeme koos pärast omaniku kinnitust. Ära veel avaldamist sisse lülita.**

1. Ava Minu Zone'is õige `elinebeauty.ee` virtuaalserver. Kontrolli SSH hosti, porti ja kasutajanime tegelikust serveri seadistusest, mitte domeeninime põhjal oletades.
2. Loo eraldi deployment'i võtmepaar turvalises arvutis, nt `ssh-keygen -t ed25519 -C "elinebeauty-github-deploy" -f elinebeauty-deploy`. Automaatika skript ootab paroolifraasita võtit; kasuta eraldi piiratud õigustega võtit, ära kasuta isiklikku põhivõtit. Avalik `.pub` osa lisa Zone SSH võtmete haldusesse. Privaatset osa hoia ainult GitHub environment secret'is.
3. Kinnita Zone'iga SSH ligipääsureeglid. Zone kasutab võtmeautentimist ja võib kasutada IP usaldusnimekirja. GitHubi tavaliste runner'ite väljuv IP muutub: vali vajadusel püsiva IP-ga runner ja kohanda `runs-on`. Ära ava kogu internetile ligipääsu pelgalt selle juhendi tõttu.
4. Kinnita domeeni **täpne absoluutne veebijuur**. Ära eelda, et see on kasutaja kodukataloog või `/`. Skript nõuab vähemalt kolme kataloogitaset (nt `/srv/example/htdocs` on ainult süntaksinäide, mitte Zone'i tegelik tee), ilma lõpus oleva `/` märgita. Kui tegelik tee ei vasta sellele, kohanda kontrolli alles pärast kinnitamist.
5. Varunda olemasolev veebijuur. SFTP **ei kustuta** faile, kuid samanimelised failid kirjutatakse üle. Kontrolli olemasolevaid `index.php`, `index.html`, `.htaccess` ja DirectoryIndex reegleid: vana `index.php` võib jätkuvalt avaleheks jääda. Failide kustutamine või olemasolevate serverireeglite muutmine vajab eraldi kokkulepet.
6. Hangi serveri SSH avalik hostivõti ja võrdle sõrmejälge usaldatud Zone'i info või toega. `ssh-keyscan -p PORT HOST` võib koguda kirje, kuid **ei tõenda iseseisvalt serveri identiteeti**. Kinnita sõrmejälg sõltumatu kanali kaudu. Töövoog ei kasuta pimedat `ssh-keyscan` usaldamist ega `StrictHostKeyChecking=no` lülitit.
7. Kontrolli, et HTTPS sertifikaat ja domeeni suunamine on Zone'is õiged. See projekt ei muuda DNS-i ega SSL-i automaatselt.

## GitHub Secrets ja Variables

Lisa **Settings → Environments → production → Environment secrets** all:

| Secret | Väärtus |
| --- | --- |
| `ZONE_HOST` | Zone'i kinnitatud SSH hostinimi või IPv4 aadress, ilma `https://` osata |
| `ZONE_PORT` | Tegelik SSH port, tavaliselt 22; kontrolli Zone'ist |
| `ZONE_USERNAME` | SSH kasutajanimi |
| `ZONE_SSH_KEY` | Täielik deployment'i privaatvõti koos BEGIN/END ridade ja reavahetustega |
| `ZONE_TARGET_PATH` | Kinnitatud olemasolev absoluutne veebijuur |
| `ZONE_KNOWN_HOSTS` | Kontrollitud OpenSSH known_hosts kirje; ebastandardse pordi puhul hostiväli `[HOST]:PORT` |

Viies nõutud secret'is puudub hosti identiteedi kontroll; turvalisuse jaoks on lisatud kuues `ZONE_KNOWN_HOSTS`. Võtmeid, paroole ega secret'ite väärtusi ei pea vestlusse saatma.

Lisa `production` **Environment variables** alla `ZONE_CONFIRMED_TARGET_PATH`, mis on täpselt sama kinnitatud tee kui `ZONE_TARGET_PATH`. See eraldi kinnitus väldib kogemata sihtkoha muutmist.

**Alles omaniku selgesõnalise kinnituse järel** lisa **Settings → Secrets and variables → Actions → Variables → Repository variable** `ZONE_DEPLOY_ENABLED` väärtusega `true`. See peab olema repository tasemel, sest töö käivitumise tingimus hinnatakse enne environment'i avamist. Enne seda peavad `production`, kinnitajad, kõik secrets ja tee kontroll olema valmis.

Järgmine main-push või käsitsi Run workflow ehitab lehe, ootab seadistatud kinnitust ja laeb failid SFTP kaudu üles. Avaldamised on järjestatud, käimasolevat ülekannet järgmine push ei katkesta. Ressursid lähevad üles enne `index.html` faili. Ülekanne ei ole atomaarne: võrguvea korral võib vaja minna sama kontrollitud build'i uuesti avaldamist. Vanu räsitud ressursse ei kustutata. Kettakasutuse puhastamine lepitakse hiljem eraldi kokku.

**Peatamine ja taastamine:** sea repository variable `ZONE_DEPLOY_ENABLED=false`. See ei katkesta juba käivat ülekannet; vajadusel peata Actionsi töö. Eelmisele versioonile naasmiseks tee `git revert` vastavale sisumuudatusele PR-i kaudu ning avalda pärast kontrolli ja kinnitust; see taastab hallatavad failid, kuid ei eemalda hiljem lisatud faile. Serveri varukoopia taastamine on eraldi Zone'i tegevus.

## Telefonist Codexi abil uuendamine

1. Ühenda GitHubi repositoorium oma Codexi pilvekeskkonnaga. Kasuta telefonis kontol kättesaadavat Codexi veebiliidest; arvuti kohalik failikaust ei ole telefonile automaatselt kättesaadav.
2. Vali repositoorium `IndrekEdur/Elinebeauty` ja alusta konkreetset ülesannet, näiteks: „Muuda src/content.ts teenuste tutvustusi järgmise teksti järgi. Säilita kujundus, käivita npm ci, npm run check, npm test ja npm run build ning ava PR. Ära muuda deployment'i lukku.“
3. Vaata telefonis üle PR-i muudatused, pildid ja Actionsi kontrollid. Ära lase tegelikke hindu, kvalifikatsioone ega kontaktandmeid välja mõelda.
4. Ühenda heakskiidetud PR `main` harusse. Kui avaldamine on sisse lülitatud, kinnita `production` töö GitHubis; vajadusel ava GitHub mobiilibrauseris, kui rakendus vajalikku vaadet ei paku.
5. Kontrolli pärast avaldamist telefonis `https://elinebeauty.ee` avalehte, menüüd, hinnakirja ja broneerimisnuppu. Zone SSH paroole ega võtmeid pole arendusvestluses vaja.

Codexi pilvevõimaluste olemasolu sõltub kontost ja ligipääsust. Pilveühendust, GitHubi environment'i ja Zone'i seadeid see lähtekoodi muudatus automaatselt ei loo.

## Enne päris avaldamist

- Kinnita tegelikud teenused, tekstid, hinnad, inimesed, kvalifikatsioonid, fotode kasutusõigus ja kontaktid.
- Asenda näidissisu ja eemalda kavandi teated alles siis, kui need enam ei kehti.
- Ühenda tegelik broneerimisteenus või jäta selge mittetoimiva ühenduse teade alles.
- Kontrolli mobiili-, tahvli- ja arvutivaadet, klaviatuuri ning reduced-motion eelistust.
- Kinnita Zone veebijuur, varukoopia, hostivõti, õigused ja GitHubi production kinnitaja.

## Ametlikud juhendid

- [Zone: SSH ühenduse loomine](https://www.zone.ee/help/kb/ssh-uhenduse-loomine/)
- [Zone: SSH ligipääsupoliitika](https://www.zone.ee/help/kb/zone-ssh-ligipaasupoliitika/)
- [GitHub: deployments ja environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments)
- [OpenAI: Codex Cloud](https://developers.openai.com/codex/cloud/)
