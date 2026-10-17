/** Kinnita sisu enne avaldamist. Null tähendab teadlikult lisamata pärisandmeid. */
export const site: {
  bookingUrl: string | null; address: string | null; phone: string | null;
  email: string | null; mapsEmbedUrl: string | null;
} = { bookingUrl: null, address: null, phone: null, email: null, mapsEmbedUrl: null };

export const services = [
  { id: 'juuksed', number: '01', title: 'Juuksuriteenused', description: 'Uus värv, värske lõikus või lihtsalt hetk, et tunda end iseendana.', image: '/images/hair.jpg', alt: 'Pikkade laineliste juuste detail — illustratiivne foto', items: ['Lõikus ja viimistlus', 'Juuste värvimine', 'Juuksehooldus'] },
  { id: 'nagu', number: '02', title: 'Näohooldused', description: 'Õrn tähelepanu sinu nahale. Tasakaal, värskus ja loomulik sära.', image: '/images/skin.jpg', alt: 'Näohoolduse rituaal — illustratiivne foto', items: ['Näohooldus', 'Niisutav hooldus', 'Naha konsultatsioon'] },
  { id: 'esteetika', number: '03', title: 'Esteetiline meditsiin', description: 'Teadlikud valikud algavad individuaalsest konsultatsioonist.', image: '/images/ritual.jpg', alt: 'Hooldustooted heledal taustal — illustratiivne foto', items: ['Esmane konsultatsioon', 'Individuaalne hooldusplaan'] },
  { id: 'ilu', number: '04', title: 'Iluhooldused', description: 'Väikesed detailid, mis annavad päevale erilise enesetunde.', image: '/images/beauty.jpg', alt: 'Hoolitsetud käte detail — illustratiivne foto', items: ['Kulmude ja ripsmete hooldus', 'Kätehooldus', 'Jalahooldus'] },
];

export const specialists = [
  { name: 'Spetsialisti nimi', role: 'Juuksur', text: 'Siia lisanduvad juuksuri tutvustus, kogemus ja erialased oskused.', image: '/images/person-1.jpg' },
  { name: 'Spetsialisti nimi', role: 'Kosmeetik', text: 'Siia lisanduvad kosmeetiku tutvustus ja hoolduste erialane taust.', image: '/images/person-2.jpg' },
  { name: 'Spetsialisti nimi', role: 'Esteetilise meditsiini spetsialist', text: 'Siia lisanduvad spetsialisti nimi, kontrollitud kvalifikatsioon ja tutvustus.', image: '/images/person-3.jpg' },
];

export const gallery = [
  { src: '/images/interior.jpg', alt: 'Rahulik hele interjöör', label: 'Ruum hingamiseks' },
  { src: '/images/skin.jpg', alt: 'Näohoolduse hetk', label: 'Aeg iseendale' },
  { src: '/images/ritual.jpg', alt: 'Hooldustoodete detail', label: 'Ilu peitub detailides' },
];
