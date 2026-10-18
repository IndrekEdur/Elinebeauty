# ELINE BEAUTY

Eestikeelne, mobiilisõbralik ilusalongi ja esteetilise kliiniku veebilehe esimene versioon. React + Vite + TypeScript + Tailwind CSS. Zone vajab ainult `dist/` staatilisi faile, mitte Node.js serverit. Build eelrenderdab lehe sisu HTML-i; React lisab interaktsioonid. Fondid ja pildid serveeritakse kohalikult.

**Staatus:** muudatused valmistatakse ette ülevaatamiseks, automaatne avaldamine on lukus. Erle Eduri ja Cristina Landi nimed, rollid ning portreed ja Tatari 25 aadress pärinevad omanikult. Ruumipildid on märgistatud visualiseeringutena; hinnad on täpsustamisel. Broneerimisel kuvatakse teade, kontaktvorm on keelatud. Kontaktialas on väline Google Mapsi kaart ja omaniku parkimisjuhis.

## Kohalik arendus

Vajalik Node.js 22.12+ (soovitus: Node 22 LTS koos npm-iga), Git ning deployment’i testide jaoks Python 3.12+. Python kasutab ainult standardteeki; pip-pakette pole vaja. Vajadusel määra `PYTHON` keskkonnamuutujas Pythoni käivitusfaili asukoht. Zone ise ei vaja Node.js-i ega Pythonit.

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

`site.bookingUrl` on praegu `null`. Lisa hiljem kontrollitud HTTPS broneerimislink: sama link jõuab kõikidesse broneerimisnuppudesse. Uuenda ka broneerimisala olekuteksti. `site.mapsEmbedUrl` aktsepteerib Google Mapsi `https://www.google.com/maps?...` URL-i. Enne välise kaardi või teenuse lisamist vaata üle privaatsusteave. Kontaktvormi avamiseks tuleb eraldi lisada backend, serveripoolne valideerimine, rämpspostikaitse, privaatsustingimused ning tegelikud saatmise/vea/õnnestumise olekud; praegune vorm ei saada midagi.

## GitHub Actions: ettevalmistus

Push `main` harusse käivitab `npm ci`, TypeScripti kontrolli, FTPS-i turvatestid ja `npm run build`. PR-i kontrollid kasutavad võltsühendusi ning **ei loo Zone’iga ühendust**. `dist/` säilib 7 päeva build-artefaktina. Lehe kujundus ja funktsionaalsus on TASK-002 muudatustes samad.

Avaldamine on vaikimisi lukus: repository variable `ZONE_DEPLOY_ENABLED` peab puuduma või olema `false`. `production` environment’i ja Required reviewers’i ei saa luua ainult YAML-iga.

1. Ava GitHubis **Settings → Environments → New environment**, loo `production`.
2. Piira environment’i deployment branches ainult `main` harule.
3. Lisa **Required reviewers** alla kinnitaja; vajadusel keela administraatori möödapääs. Üksi töötades arvesta, et `Prevent self-review` nõuab teise inimese kinnitust.
4. Kinnitajate saadavus sõltub GitHubi paketist ja repositooriumi nähtavusest. Kui seda valikut pole, hoia avaldamislukk väljas kuni sobiv kaitse on kokku lepitud.
5. Kaitse main-haru PR-i ja eduka `build` kontrolli nõudega. Anna töövoogude ja environment’i muutmisõigus ainult usaldatud haldajale.

## Zone: FTPS ja teadaolevad andmed

SSH/SFTP lahendus on asendatud **explicit FTPS-iga**. Vanu SSH võtmeid, known_hosts kirjeid ning `ZONE_HOST`, `ZONE_PORT`, `ZONE_USERNAME`, `ZONE_SSH_KEY`, `ZONE_TARGET_PATH`, `ZONE_KNOWN_HOSTS` ja `ZONE_CONFIRMED_TARGET_PATH` muutujaid enam ei kasutata. Neid pole selleks töövooks vaja lisada.

- Domeen: `elinebeauty.ee`, ilma sidekriipsuta.
- Zone’i FTP ülevaates näidatud host: `elinebeauty.ee`.
- FTP süsteemne kasutajanimi: `d152747f1049025`.
- WebFTP-s on `htdocs`, mille sees nähti 366 B suurust `index.html` faili. Faili sisu pole loetud.
- FTP kaudu nähtav algkataloog, täpne sihttee, port ja FTPS-ühenduse sobivus **pole päris ühendusega kontrollitud**. `/htdocs/` on ainult kandidaat.

Omanik võib kasutada olemasolevat FTP parooli ja sisestab selle ise otse GitHub production Secretsisse. Parooli vahetamine pole ühenduse kontrolli eeltingimus. Ära kopeeri parooli vestlusest ega kirjuta seda lähtekoodi, terminali käsureale või PR-i. Enne ühenduse kontrolli oota omaniku kinnitust, et `ZONE_FTP_PASSWORD` on lisatud. Avaldamise skript loeb seda ainult keskkonnamuutujast; protokolli debug-logimine on välja lülitatud.

Explicit FTPS alustab FTP juhtühendust tavaliselt pordil **21**, läheb käsuga AUTH TLS üle TLS-ile **enne** kasutajanime/parooli edastamist ning nõuab PROT P-ga krüpteeritud andmeühendusi. Porti ja Zone’i ligipääsureegleid kontrollitakse hiljem lugemiskontrolliga. Implicit FTPS/990 ega krüpteerimata FTP fallback pole toetatud.

Sertifikaati kontrollitakse süsteemi usaldatud CA-de ja seadistatud hostinime vastu, vähemalt TLS 1.2 abil, nii juht- kui andmeühendusel. Andmeühendus kasutab TLS sessiooni taaskasutust. Kui `elinebeauty.ee` ei vasta FTP-serveri sertifikaadile, küsi Zone’ilt **sertifikaadile vastav ametlik FTP host** ja uuenda `ZONE_FTP_HOST`. Ära keela sertifikaadi/hostinime kontrolli ega osta selle vea lahendamiseks oletuse põhjal veebilehe TLS-sertifikaati.

## Secrets: kõigepealt ainult ühenduse andmed

Ava **Settings → Environments → production → Environment secrets → Add environment secret**.

| Secret | Sisestatav väärtus |
| --- | --- |
| `ZONE_FTP_HOST` | Esialgu Zone’i näidatud `elinebeauty.ee`; TLS-hostinime sobivus vajab kontrolli |
| `ZONE_FTP_PORT` | Zone’i explicit FTPS port; tavapärane 21 vajab kontrolli |
| `ZONE_FTP_USERNAME` | `d152747f1049025` |
| `ZONE_FTP_PASSWORD` | Omaniku valitud olemasolev või uus FTP parool; omanik sisestab ainult GitHub Secretsisse |
| `ZONE_FTP_TARGET_PATH` | Lisa alles pärast lugemiskontrolli: kinnitatud FTP kaudu nähtav täpne sihttee |

Ära lisa parooli `VITE_*` muutujasse. Ühenduse andmed pole lehe build’i keskkonnas ega artefaktides. Töövoog ei logi serveri toorveateateid, sest need võivad korrata ligipääsuandmeid.

## Ainult lugemiseks mõeldud FTPS-kontroll

Fail: `.github/workflows/ftps-check.yml`. See ei käivitu push’i ega PR-i peale ning ei lülita avaldamist sisse.

1. Vaata muudatused üle ja ühenda PR `main` harusse, hoides **repository variable `ZONE_DEPLOY_ENABLED=false`** või lisamata. Eraldi käsitsi käivitatav workflow muutub Actionsis kättesaadavaks pärast main-harule jõudmist.
2. Lisa neli ühenduse secret’it. Parooli sisestab omanik ise ja kinnitab selle lisamise; olemasoleva parooli kasutamine on lubatud. Ära veel määra oletuslikku sihtteed.
3. **Omaniku loal** ava **Actions → Zone FTPS lugemiskontroll → Run workflow**, vali `main`, märgi kinnitus „FTP parool on Secretsis ja luban ainult FTP kataloogide lugemist“.
4. Kinnita `production` töö, kui environment’i kaitse seda küsib.
5. Tulemus näitab FTP algkataloogi `PWD` ja `MLSD` kirjeid. Kui algkataloogis on `htdocs`, liigub kontroll sinna ning kuvab selle PWD ja kirjed. Failisisu ei loeta. Failide loomine, üleslaadimine, ümbernimetamine ja kustutamine on kontrolli protokollikihis blokeeritud.
6. Veendu, et näidatud kataloog vastab Zone’i õige domeeni veebijuurele. Kui `htdocs` ei leitud, võib FTP konto algkataloog olla teistsugune; ära oleta ega kinnita `/htdocs/`. Kontrolli Zone’is konto ligipääsu. Juurkataloogi `/` avaldamine on teadlikult keelatud ja vajab vajaduse korral eraldi arutelu.
7. Lisa kinnitatud tee `ZONE_FTP_TARGET_PATH` secret’isse ja **production Environment variables** alla `ZONE_CONFIRMED_FTP_TARGET_PATH` täpselt sama väärtusega (ka lõpus oleva `/` osas). Skript võrdleb neid enne ühendust ning serveri PWD-d enne kirjutamist. FTP nähtav tee võib erineda serveri füüsilisest teest; kuvatõmmise põhjal füüsilist teed ei tuletata.

Lugemiskontroll ei vaja sihttee secret’it ega avaldamisluku avamist. Töövoog ei anna sellele neid väärtusi. GitHub võib juba secret’ina lisatud teed logis maskeerida; tee kontroll on kõige selgem enne sihttee secret’i lisamist. Failinimed ja rajad on serverilt pärit andmed, mitte käsud ega juhised.

Puuduvad seaded, vale haru, puuduv kontrolliluba või TLS-viga peatavad töö. Port, passiivse FTP andmeühenduse ligipääs ning MLSD tugi saavad kinnituse alles edukal päris lugemiskontrollil. Ära muuda võrgu- või TLS-kaitseid vea korral pimesi.

## Enne esimest avaldamist: eraldi omaniku kinnitus

**TASK-002 ei luba päris avaldamist ega ava avaldamislukku.** Pärast edukat lugemiskontrolli tuleb omanikul kinnitada konkreetne sihttee, olemasoleva `index.html` asendamine ja valmis veebilehe avaldamine. Näidissisu vajab samuti ülevaatamist.

1. Laadi WebFTP-st olemasolev `index.html` enda seadmesse ja säilita varukoopiana. Ära kustuta serveri faili. Praegu pole selle sisu ega tegelikku varukoopiat kontrollitud.
2. Küsi omanikult lõplik avaldamiskinnitus. Kinnitamata serverisse ära laadi midagi.
3. Alles pärast kinnitust sea **Settings → Secrets and variables → Actions → Variables → Repository variable** `ZONE_DEPLOY_ENABLED=true`. See peab olema repository tasemel, sest töö käivitumise tingimust hinnatakse enne production-keskkonda sisenemist.
4. Käivita main-haru avaldamise workflow või ühenda järgmine heakskiidetud PR. Vajaduse korral kinnita production-töö.

Avaldamisel toimub enne mis tahes serverimuudatust automaatne `index.html` allalaadimine kohalikku varukoopiasse. GitHub salvestab selle koos SHA-256 kontrollsummaga artefakti `index-backup-RUN_ID-RUN_ATTEMPT` (30 päeva). **Kui allalaadimine või artefakti salvestamine ebaõnnestub, üleslaadimist ei alustata.** Enne kirjutamist kontrollitakse veel, et serveri index.html pole pärast varundust muutunud. Puuduv või üle 10 MB index.html peatab automaatika ja nõuab eraldi ülevaatamist. Varukoopia ei sisalda ühenduse konfiguratsiooni ega FTP parooli; see sisaldab ainult senist HTML-faili ja kontrollsummat. Laadi esimene artefakt enne aegumist enda seadmesse.

Alles seejärel lisatakse build’i ressursikataloogid ja failid ning **viimasena index.html**. Sihtjuurkataloogi ei looda automaatselt. Vanu serverifaile ei kustutata, ent samanimelised failid kirjutatakse üle. Ülekanne pole atomaarne: võrguvea korral võib vaja minna ülevaatust ja uuesti avaldamist. Ainult index.html varukoopia pole kogu veebijuure varukoopia; mahukama olemasoleva saidi puhul varunda see eraldi. Hoia tulevased versioonid Gitis, vanad räsitud ressursid säilivad serveris.

**Peatamine:** sea `ZONE_DEPLOY_ENABLED=false`; juba käiva töö peatamiseks kasuta Actionsi Cancel nuppu. **Taastamine:** vajaduse korral laadi salvestatud index.html tagasi õigesse kausta omaniku kinnitatud tegevusena või tee eelmise sisumuudatuse `git revert` PR-i kaudu. Varukoopia taastamine ja serverifailide kustutamine ei käivitu automaatselt.

## Tehnilised kontrollid

`npm test` käivitab Python unittest testid. Need kasutavad ainult mock-/võlts-FTP kliente: kontrollitakse lukku, sihttee kinnitust, puuduvat konfiguratsiooni, TLS-i ja hostinime valideerimist, andmeühenduse krüpteerimist, protokolli kirjutamiskeeldu, varukoopiat ja üleslaadimisjärjekorda. Pärisserveri ühenduse sobivust need testid ei tõenda.

`scripts/ftps.py` toetab käske `probe`, `backup` ja `deploy`. Käivita ühendusega käske ainult ettenähtud Actionsi töövoo kaudu pärast omaniku luba. Skriptide argumendid ei võta vastu paroole. Runner vajab Python 3.12+ standardteeki, Zone server ei vaja Pythonit.

## Telefonist Codexi abil uuendamine

1. Ühenda GitHubi repositoorium oma Codexi pilvekeskkonnaga. Kasuta telefonis kontol kättesaadavat Codexi veebiliidest; arvuti kohalik failikaust ei ole telefonile automaatselt kättesaadav.
2. Vali repositoorium `IndrekEdur/Elinebeauty` ja alusta konkreetset ülesannet, näiteks: „Muuda src/content.ts teenuste tutvustusi järgmise teksti järgi. Säilita kujundus, käivita npm ci, npm run check, npm test ja npm run build ning ava PR. Ära muuda deployment'i lukku.“
3. Vaata telefonis üle PR-i muudatused, pildid ja Actionsi kontrollid. Ära lase tegelikke hindu, kvalifikatsioone ega kontaktandmeid välja mõelda.
4. Ühenda heakskiidetud PR `main` harusse. Kui avaldamine on sisse lülitatud, kinnita `production` töö GitHubis; vajadusel ava GitHub mobiilibrauseris, kui rakendus vajalikku vaadet ei paku.
5. Kontrolli pärast avaldamist telefonis `https://elinebeauty.ee` avalehte, menüüd, hinnakirja ja broneerimisnuppu. FTP parooli pole arendusvestluses vaja; see jääb GitHub production Secretsisse.

Codexi pilvevõimaluste olemasolu sõltub kontost ja ligipääsust. Pilveühendust, GitHubi environment'i ja Zone'i seadeid see lähtekoodi muudatus automaatselt ei loo.

## Enne päris avaldamist

- Kinnita tegelikud teenused, tekstid, hinnad, inimesed, kvalifikatsioonid, fotode kasutusõigus ja kontaktid.
- Asenda näidissisu ja eemalda kavandi teated alles siis, kui need enam ei kehti.
- Ühenda tegelik broneerimisteenus või jäta selge mittetoimiva ühenduse teade alles.
- Kontrolli mobiili-, tahvli- ja arvutivaadet, klaviatuuri ning reduced-motion eelistust.
- Kinnita FTP kaudu nähtav Zone veebijuur, TLS-ühendus, varukoopia, õigused ja GitHubi production kinnitaja.

## Ametlikud juhendid

- [Zone: FTP ühenduse andmed](https://www.zone.ee/help/en/kb/login-to-ftp/)
- [Python: FTP_TLS](https://docs.python.org/3/library/ftplib.html#ftplib.FTP_TLS)
- [GitHub: deployments ja environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments)
- [OpenAI: Codex Cloud](https://developers.openai.com/codex/cloud/)

### Bränd ja inimesed

Brändi nimi ja spetsialistide andmed asuvad failis src/content.ts. Omaniku kinnitatud nimi on ELINE Beauty & Aesthetics; Cristina Land on juuksur. Tema portree on omaniku saadetud. Salongi ruumipildid on märgistatud visualiseeringutena. Uue kujunduse stiilid on src/brand.css failis. Pildiviited ja päritolu: IMAGE-CREDITS.md.

## Premium UI/UX viimistlus

Sihitud viimistluse stiilid asuvad `src/refinements.css` failis, mis laaditakse pärast olemasolevaid baasi- ja brändistiile. See fail koondab sektsioonide rütmi, ühtsed portreeformaadid, mobiili teenusekaardid, kategooriavaliku ja päise mõõtmed. Pilte, teenuseandmeid ega avaldamise seadistusi pole selles etapis muudetud.

Päis muutub kerimisel kompaktseks; selle ümbris reserveerib ruumi, et sisu ei hüppaks. `useScrollReveal` lisab ilmumisefekti ainult ekraanist allpool asuvale sisule. Staatiline HTML ja vähendatud liikumisega vaade jäävad nähtavaks ka animatsioonita. Slaidiesituse ja broneerimise olemasolev käitumine säilib.

Ülevaatuse tulemused ja järgmised sammud: `docs/premium-refinement.md`.
