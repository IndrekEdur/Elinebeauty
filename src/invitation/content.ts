/** Kinnita kuupäev, kellaaeg, programm ja kontaktid enne avaldamist. */
export const invitation = {
  date: 'Kuupäev selgumisel',
  time: 'Kellaaeg selgumisel',
  address: 'Tatari 25, Tallinn',
  dressCode: 'Riietusstiil täpsustamisel',
  programme: [
    { time: 'Aeg lisandub', title: 'Õhtu algus', description: 'Siia lisandub külaliste vastuvõtu kirjeldus.' },
    { time: 'Aeg lisandub', title: 'Uus peatükk', description: 'Siia lisandub avamishetke programm.' },
    { time: 'Aeg lisandub', title: 'Aeg koos olemiseks', description: 'Siia lisandub õhtu jätku kirjeldus.' },
  ],
  instagramUrl: null as string | null,
  email: null as string | null,
};

export type Rsvp = { name: string; attending: boolean; plusOne: boolean };
/** Ühenda siin hiljem backend. Demo ei salvesta ega edasta isikuandmeid. */
export async function submitRsvp(_response: Rsvp): Promise<{ mode: 'demo' }> {
  return { mode: 'demo' };
}
