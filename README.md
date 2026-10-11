# SYSTEM

A Solo Leveling-inspired workout and running tracker. You are the **Hunter**. Clear quests, log your sets and runs, beat your own records, and level up from E-rank to S-rank.

Everything is user-defined: your exercises, your quests, your sets, reps and weights, your runs. The app tracks, gamifies and visualizes. There is no AI and no auto-generated plan.

> Status: v1 (local-only, no backend, no login)

---

## Features

### Strength
- **Status Window**: hunter name, level, rank (E to S), XP bar, streak, today's quest progress, total volume, and STR / VIT / AGI / END stats
- **Daily Quests**: quest cards with XP rewards, repeat on chosen weekdays, rest-day toggle that keeps your streak safe
- **Quest Builder**: create quests from your exercise library with target sets, reps and weight
- **Exercise Library**: add, edit and delete custom exercises (including home and bodyweight workouts)
- **Active Workout**: step through exercises, big +/- inputs, set-done checkbox, previous session reference, rest timer, and an "increase weight for next time" shortcut

### Running
- **Run Log**: log distance, time, notes and run type (Run, Jog, Walk, Treadmill) with live pace calculation
- **Live Stopwatch**: timestamp-based, so it survives page refresh and background tabs
- **Personal Records**: strength PRs (best weight, estimated 1RM) and running PRs (fastest 1K / 3K / 5K / 10K, longest run, best pace)
- **PR Challenge**: race against your own record with a live AHEAD / BEHIND indicator and a ghost progress bar

### General
- **History**: calendar with workout days and run days marked differently, session details, and a weight-over-time chart
- **Settings**: kg / lb, km / mi, default rest time, export data as JSON, reset all data

---

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- lucide-react (icons)
- recharts (charts)
- localStorage for persistence (no backend)

---

## Getting Started

### Prerequisites
- Node.js 18.18 or newer
- npm, pnpm or yarn

### Install and run

```bash
# clone the repo
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>

# install dependencies
npm install

# start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production build

```bash
npm run build
npm start
```

---

## Project Structure

The exact layout may differ slightly depending on how the project was generated. The general idea:

```
app/
  page.tsx              Status window
  quests/               Daily quests and quest builder
  exercises/            Exercise library
  workout/[questId]/    Active workout logging
  runs/                 Run log and run logger
  records/              Personal records
  challenge/            PR challenge
  history/              Calendar, sessions, charts
  settings/             Units, export, reset
components/             Reusable UI components
lib/
  store.tsx             Typed data layer (React context + localStorage)
  game.ts               XP, level, rank, stats and streak logic
  constants.ts          All tuning values in one place
  pace.ts               Pace and time helpers
  types.ts              Shared TypeScript types
```

---

## Game Logic

All rules live in plain code so they are easy to tweak.

- **XP per set** is based on reps x weight. Bodyweight exercises use a fixed base value.
- **XP per run** is based on distance with a pace multiplier.
- **Daily XP caps** for both strength and running prevent farming.
- **Input validation** rejects unrealistic runs (for example, pace faster than 2:30 min/km).
- **Levels and ranks** use progressive thresholds. Rank changes at set levels.
- **Stats**: Push / Pull raise STR, Legs raise VIT, Running and Cardio raise AGI, Core and timed work raise END.
- **Streak** continues on quest-clear days, run days and rest days. It breaks otherwise.

To change any of these values, edit `lib/constants.ts`.

---

## Data and Privacy

All data is stored in your browser's `localStorage`. Nothing is sent to a server. Clearing your browser data will erase your progress, so use **Settings > Export JSON** to back up regularly.

---

## Roadmap

- [ ] Achievements and titles
- [ ] Separate hunter profile page
- [ ] Progress charts for every exercise
- [ ] GPS run tracking with route map
- [ ] Login and database (Supabase, Firebase or similar)
- [ ] Friend challenges and leaderboards
- [ ] AI "System" coach chatbot (natural language logging and quest creation)
- [ ] Auto progression for bodyweight exercises

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## License

MIT. Add a `LICENSE` file if you want this to be official.
