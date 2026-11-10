/** Kinnita kontaktid enne avaldamist. */
export const invitation = {
  date: '28. november',
  time: '18:00',
  address: 'Tatari 25, Tallinn',
  productNote: 'Avamispeol on CHI ja Jeudermi tooted soodushindadega.',
  giftNote: 'Esimest 50 osalejat ootab kotikene kingitustega.',
  instagramUrl: 'https://www.instagram.com/the.eline.beauty/',
  email: 'info@elinebeauty.ee',
  phone: '53237173',
  phoneLabel: '5323 7173',
};

export type Rsvp = { name: string; attending: boolean; plusOne: boolean };
export async function submitRsvp(response: Rsvp, website: string): Promise<void> {
  const result = await fetch('/kutse/rsvp.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ ...response, website }),
    signal: AbortSignal.timeout(15000),
  });
  const data = await result.json().catch(() => null);
  if (!result.ok || data?.ok !== true) {
    throw new Error(result.status === 429
      ? 'Oled hiljuti vastuse saatnud. Palun oota minut ja proovi uuesti.'
      : 'Vastust ei õnnestunud saata. Proovi hiljem uuesti või kirjuta info@elinebeauty.ee.');
  }
}
