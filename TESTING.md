# Testing Guide for chefamo

## Overview

`chefamo` uses:

- Vitest for unit and component tests
- React Testing Library for UI behavior
- Node test runner for lightweight domain suites
- Playwright for end-to-end coverage

## Main commands

```bash
npm test
npm run test:vitest
npm run test:node
npm run test:e2e
npm run build
```

## Current focus

- activity, place, and organizer discovery
- favorites and saved plan behavior
- import validation for normalized entity CSVs
- freshness and readiness policy
