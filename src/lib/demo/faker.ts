// Minimal local faker shim for demo data during development.
// Provides only the functions used by the room page.

function randomChoice<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const faker = {
  company: {
    catchPhrase: () => randomChoice([
      "A luxury escape you'll never forget",
      "Intimate stays with bespoke service",
      "An elevated retreat in nature",
      "A curated experience of comfort and style",
    ]),
  },
  hacker: {
    phrase: () => randomChoice([
      "Private beach access",
      "Rooftop dining with views",
      "Spa treatments on request",
      "Personalised excursions",
    ]),
  },
  phone: {
    number: (fmt = '+1-###-###-####') => {
      const digits = () => Math.floor(Math.random() * 900) + 100
      return `+1-${digits()}-${digits()}-${Math.floor(Math.random() * 9000) + 1000}`
    },
  },
  person: {
    fullName: () => randomChoice([
      "Amara Osei",
      "Liam Nakamura",
      "Sofia Ribeiro",
      "Noah Patel",
    ]),
  },
  lorem: {
    sentences: (n = 2) => {
      const pool = [
        "Comfortable rooms with local character.",
        "Complimentary breakfast with seasonal ingredients.",
        "Close to major attractions and private tours.",
        "Family-friendly amenities and concierge service."
      ]
      return Array.from({ length: n }).map(() => randomChoice(pool)).join(' ')
    },
  },
}
