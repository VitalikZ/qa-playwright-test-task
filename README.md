# TUI.nl booking flow – Playwright test

This is an end-to-end test with Playwright + TypeScript for the booking flow on https://www.tui.nl/h/nl.

The test goes through:
- searching for a holiday on the home page (random departure airport, destination, date, 2 adults + 1 child)
- picking the first available hotel from the results
- checking and confirming the flights
- going to the passenger details page and checking validation

## Requirements

- Node.js
- npm

## Install

npm install
npx playwright install chromium

## Run

# run tests
npx playwright test

# view HTML report
npx playwright show-report
