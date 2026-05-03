# FinTrack Client

React + Vite frontend for FinTrack.

## Scripts

- `npm run dev` starts the local Vite server.
- `npm run build` creates a production build.
- `npm run lint` checks the React source with ESLint.
- `npm run preview` serves the production build locally.

## Environment

Create `client/.env` when the API is not served from the same origin:

```env
VITE_API_URL=http://localhost:8000/api
```

The app stores the JWT in `localStorage` and sends it on API requests through `src/utils/api.js`.
