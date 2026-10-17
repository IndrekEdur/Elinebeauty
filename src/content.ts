/** Kinnita sisu enne avaldamist. Null tähendab teadlikult lisamata pärisandmeid. */
export const brand = { name: 'ELINE', descriptor: 'BEAUTY & AESTHETICS', fullName: 'Eline Beauty & Aesthetics' };
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
  { name: 'Cristina Land', role: 'Juuksur', text: 'Tutvu meie juuksuri Cristina Landiga. Teenuste täpsem info ja võimalus tema juurde aega broneerida lisanduvad peagi.', image: '/images/cristina-land.jpg', alt: 'Juuksur Cristina Land' },
];

export const gallery = [
  { src: '/images/salon-front-concept.jpg', alt: 'Salongi vastuvõtuala ja juuksurikohad — interjööri visualiseering', label: 'Soe vastuvõtt', note: 'Salongi interjööri visualiseering. Tegemist ei ole valminud ruumi fotoga.', concept: true },
  { src: '/images/salon-plan-concept.jpg', alt: 'Salongi ruumilahendus ülaltvaates — interjööri visualiseering', label: 'Ruum sinu ilu jaoks', note: 'Salongi ruumilahenduse visualiseering. Tegemist ei ole valminud ruumi fotoga.', concept: true },
  { src: '/images/skin.jpg', alt: 'Näohoolduse hetk — illustratiivne foto', label: 'Aeg iseendale', note: 'Illustratiivne näidisfoto, mitte Eline Beauty & Aesthetics salongi tegelik foto.', concept: false },
];
