# TUI.nl booking flow – Playwright test

This is an end-to-end test with Playwright + TypeScript for the booking flow on https://www.tui.nl/h/nl.

## Test Flow

The test goes through:
- Searching for a holiday on the home page (random departure airport, destination, date, 2 adults + 1 child)
- Picking the first available hotel from the results
- Checking and confirming the flights
- Going to the passenger details page and checking validation

## Requirements

- Node.js
- npm

## Installation

```bash
npm install
npx playwright install chromium
```

## Running Tests

### Run tests

```bash
npx playwright test
```

### View HTML report

```bash
npx playwright show-report
```
