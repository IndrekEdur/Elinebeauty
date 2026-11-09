/** Kinnita kontaktid enne avaldamist. */
export const invitation = {
  date: '28. november',
  time: '18:00',
  address: 'Tatari 25, Tallinn',
  productNote: 'Avamispeol on CHI ja Eudermi tooted soodushindadega.',
  giftNote: 'Esimest 50 osalejat ootab kotikene kingitustega.',
  instagramUrl: null as string | null,
  email: null as string | null,
};

export type Rsvp = { name: string; attending: boolean; plusOne: boolean };
/** Ühenda siin hiljem backend. Demo ei salvesta ega edasta isikuandmeid. */
export async function submitRsvp(_response: Rsvp): Promise<{ mode: 'demo' }> {
  return { mode: 'demo' };
}
