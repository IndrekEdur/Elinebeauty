# Kutse kontroll

Lähteharu: `main`, lähtecommit `5de8f43`. Tööharu: `feat/kutse-invitation`.

- `npm ci`: edukas, 0 tuvastatud haavatavust.
- `npm run check`: edukas.
- `npm test`: kõik 23 olemasolevat mock-FTPS testi edukad; päris FTP ühendust ei loodud.
- `npm run build`: edukas, mõlema lehe HTML eelrenderdatud.
- `git diff --check`: edukas.
- Chromium: 320, 390, 768 ja 1440 px; horisontaalset ülevoolu pole, foto laeb.
- Otse `/kutse` avamine suunatakse lokaalses preview's `/kutse/` peale ja näitab kutset.
- RSVP: nimi, jah/ei ja kaaslane; eitamisel kaaslase valikud keelatud.
- Demovormi saatmine ei tekita võrgupäringut; tagasiside ütleb, et andmeid ei saadetud.
- Reduced-motion lülitab animatsioonid välja.
- JavaScriptita on kutse sisu staatilises HTML-is olemas.
- Avaleht avaneb endise pealkirjaga ega lae kutse CSS-i.
- Brauserikonsoolis ja Reacti hüdratsioonis vigu ei ilmnenud.
- Mobiili- ja töölauakuvatõmmised visuaalselt kontrollitud.

Windowsi keskkonnas käivitati npm kohaliku ajutise Node 22/npm abil ja Python
kaasasolevast runtime'ist; testide ajutine kataloog suunati töökausta, sest
vaikimisi sandbox-TEMP polnud Pythonile kirjutatav. Repositooriumi sõltuvusi
ega testide lähtekoodi ei muudetud.

Zone'i tegelikku `/kutse` vastust pole kontrollitud, sest avaldamist ega serveri
ühendust pole lubatud. Lahendus kasutab standardset kataloogi `index.html`-iga,
mida olemasolev rekursiivne FTPS üleslaadija toetab.
