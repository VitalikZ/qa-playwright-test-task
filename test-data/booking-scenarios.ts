import type { BookingScenario } from '@types';

const bookingScenarios: BookingScenario[] = [
  {
    name: 'Family with 1 child',
    description: 'Standard family vacation - 2 adults + 1 child',
    adults: 2,
    children: 1,
    duration: 7,
    tags: ['family', 'standard'],
  },
  {
    name: 'Couple',
    description: 'Romantic vacation - 2 adults, no children',
    adults: 2,
    children: 0,
    duration: 10,
    tags: ['couple'],
  },
  {
    name: 'Solo traveler',
    description: 'Solo vacation - 1 adult',
    adults: 1,
    children: 0,
    duration: 3,
    tags: ['solo', 'short'],
  },
];

export const defaultScenario: BookingScenario = bookingScenarios[0]!;

