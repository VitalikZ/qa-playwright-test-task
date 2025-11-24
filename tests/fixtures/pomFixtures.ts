import { test as base } from '@playwright/test';
import {
  HomePage,
  ResultsPage,
  HotelDetailsPage,
  FlightsSelectionPage,
  PassengerDetailsPage,
} from '@pages/index';
import type { BookingScenario } from '@types';
import { defaultScenario } from '../../test-data/booking-scenarios';

type Fixtures = {
  homePage: HomePage;
  resultsPage: ResultsPage;
  hotelDetailsPage: HotelDetailsPage;
  flightsSelectionPage: FlightsSelectionPage;
  passengerDetailsPage: PassengerDetailsPage;
  scenario: BookingScenario;
};

export const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  resultsPage: async ({ page }, use) => {
    await use(new ResultsPage(page));
  },
  hotelDetailsPage: async ({ page }, use) => {
    await use(new HotelDetailsPage(page));
  },
  flightsSelectionPage: async ({ page }, use) => {
    await use(new FlightsSelectionPage(page));
  },
  passengerDetailsPage: async ({ page }, use) => {
    await use(new PassengerDetailsPage(page));
  },
  scenario: async ({}, use) => {
    await use(defaultScenario);
  },
});

export { expect } from '@playwright/test';

