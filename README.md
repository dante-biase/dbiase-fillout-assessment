# Fillout - Software Engineering Assignment
**Dante Biase | 3/12/2024**

- Backend: Node.js, Express, TypeScript with Joi for validation
- Unit Testing: Jest, Supertest, Nock
- Formmating: Prettier


>Note: tried to provide a small example of something I would submit in a production environment in a reasonable amount of time for this specific assignment. Given more time, additional documentation, testing, error handling, validation, would obviously be necessary with some additional refactoring opportunities.


## Setup

### install
```bash
npm i
```

### Manual
```bash
# Initialize npm and install production dependencies
npm init --yes
npm install express cors dotenv axios joi

# Install development dependencies
npm install --save-dev typescript ts-node-dev nodemon ts-jest supertest nock

# Install TypeScript definitions
npm install --save-dev @types/express @types/cors @types/joi @types/jest @types/supertest @jest/types

# Initialize TypeScript
npx tsc --init
```

### Environment
Copy the `.env.example` file to `.env` and fill in PORT, FORM_ID, and BEARER_TOKEN.

```bash
cp .env.example .env
```


## Run
```bash
npm run dev 
```


## Test

Included is some very basic testing for the API for demonstration pursposes.
```bash
npm run test
```

In case of any issues - *"wElL iT wOrKs On mY mAcHinE"*

```bash
 PASS  tests/server.test.ts
  GET /:formId/filteredResponses
    ✓ responds with json (20 ms)
    ✓ filters responses correctly (7 ms)
    ✓ paginates responses correctly (20 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        0.59 s, estimated 1 s
Ran all test suites.
```