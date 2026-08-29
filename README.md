# LandWatch — Predictive Analytics System for Early Detection of Land Acquisition Delays

A web dashboard that predicts and explains **delay risk** for land acquisition
cases, so administrators can intervene *before* a project stalls.

Built with **React + TypeScript + Vite** and **Recharts**. Runs fully offline
with a built-in dataset and a transparent, explainable risk-scoring engine — no
backend or API keys required.

## Features

- **Overview Dashboard** — portfolio KPIs, risk distribution, average risk by
  acquisition stage, and a top-priority parcel list.
- **Land Parcels** — searchable, filterable and sortable table of every case.
- **Parcel Detail** — full risk breakdown showing *which factors* drive the
  score, a delay-risk gauge, predicted delay days, on-time probability, and
  recommended interventions.
- **Risk Predictor** — an interactive what-if tool: adjust parameters (consent %,
  litigations, documentation, stage duration, etc.) and see the predicted delay
  risk update in real time.

## How the prediction works

The engine (`src/lib/riskEngine.ts`) normalizes each risk signal to a 0–1
"pressure" value, multiplies it by an interpretable weight, and sums them into a
0–100 score. Because each factor's contribution is exposed, every prediction is
**explainable** — you can see exactly why a parcel is flagged. The same
interface could later be backed by a trained ML model without changing the UI.

Signals include: stage-duration overrun, pending litigations, owner-consent
shortfall, compensation disputes, documentation gaps, public objections, budget
approval status, displaced-family load, and seasonal (monsoon) risk.

## Run locally

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Then open the URL shown in the terminal (default http://localhost:5173).

> On Windows PowerShell, if `npm` is blocked by execution policy, use `npm.cmd`
> instead (e.g. `npm.cmd install`, `npm.cmd run dev`).

### Other commands

```bash
npm run build     # type-check + production build into dist/
npm run preview   # preview the production build
```

## Project structure

```
src/
  components/     # Layout, Badge, ProgressBar
  lib/
    data.ts       # mock land-acquisition dataset
    riskEngine.ts # explainable delay-risk model
  pages/          # Dashboard, Parcels, ParcelDetail, Predict
  types.ts        # shared TypeScript types
  styles/global.css
```

## Notes for the demo / hackathon

- The dataset in `src/lib/data.ts` is illustrative. Swap it for real acquisition
  records (or wire it to an API) and the whole UI works unchanged.
- Risk weights in `riskEngine.ts` are tunable in one place.
