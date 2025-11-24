export const config = {
  baseURL: 'https://www.tui.nl',

  timeouts: {
    short: 5000,
    default: 15000,
    medium: 30000,
    long: 60000,
    navigation: 30000,
  },
} as const;
