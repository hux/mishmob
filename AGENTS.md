# AGENTS.md — MishMob Agent Guide

This file guides code agents working in this repository. It summarizes and operationalizes the project context from `CLAUDE.md` into concrete conventions, dos/don'ts, and where-to-put-what rules. Its scope is the entire repository.

## Non‑Negotiables
- Backend API runs on `http://localhost:8080` (do not use 8000).
- Frontend dev server typically runs on `http://localhost:8081` (Vite picks an open port).
- Keep changes minimal, focused, and consistent with the current stack and design system.

## Project Snapshot
- Mission: Mobilize volunteers into local micro‑missions that build purpose and community.
- Stack
  - Frontend: React 18 + TypeScript, Vite, shadcn/ui (Radix), Tailwind, React Router v6, TanStack Query, RHF + Zod, Lucide.
  - Backend: Django + Django Ninja (Pydantic), PostgreSQL + PostGIS, JWT auth, Allauth, S3/GCS.
  - Infra: Docker, Nginx, GitHub Actions; target cloud is AWS (EC2/ECS), Aurora Serverless v2.

## Directories and Ownership
- `frontend/` (current web app)
  - `src/api/`: typed API clients and TanStack Query helpers.
  - `src/components/ui/`: reusable UI primitives (extend shadcn/ui).
  - `src/features/`: feature modules (auth, opportunities, profile, project‑management, lms).
  - `src/pages/`: route components and page composition.
  - `src/hooks/`, `src/lib/`, `src/assets/` as named.
- `backend/` (Django monorepo target)
  - `mishmob/` core, `api/` (Ninja), `users/`, `opportunities/`, `lms/` apps.
- `mobile/` (future/ongoing React Native work).

Place new files in the module that matches their concern. Do not create parallel, duplicate folders.

## Frontend Conventions
- Language: TypeScript with strict types where practical.
- Components
  - Prefer functional components and hooks.
  - Put shared primitives in `src/components/ui/`; keep them theme‑aware.
  - Feature‑specific components live under `src/features/<feature>/`.
- Styling
  - Tailwind only; avoid CSS‑in‑JS. Use existing CSS variables in `src/index.css` for theming.
  - Follow the brand palette: Primary (blue), Secondary (orange), Accent (green) from CLAUDE.md.
- State
  - Server state: TanStack Query (mutations/queries, caching, invalidation).
  - Local state: React hooks. Forms: React Hook Form + Zod.
  - Avoid adding new global state libraries.
- Routing
  - React Router v6. Register routes in `src/App.tsx`.
  - Prefer code‑splitting for large, new routes when feasible.
- Icons: Lucide React. Keep icon usage consistent in size/weight.
- Accessibility: Use Radix/shadcn patterns; label controls; keyboard‑navigable components.

## Backend Conventions
- Framework: Django + Django Ninja.
- API design: RESTful paths as outlined in `CLAUDE.md` (auth, users, opportunities, projects, lms).
- Auth: JWT for API, Allauth for social; enforce authenticated endpoints where applicable.
- Data
  - PostgreSQL with PostGIS for geospatial queries.
  - Keep models aligned with the noted domain: Users, Skills, Opportunities, Roles, LMS.
- Changes to endpoints or models must include minimal inline docstrings and update any relevant docs where referenced.

## Do / Don’t
- Do
  - Adhere to port 8080 for backend; keep CORS/dev URLs in sync.
  - Reuse and extend shadcn/ui primitives; keep variants consistent.
  - Keep functions small, typed, and testable; prefer composition.
  - Use TanStack Query for all server interactions; centralize API clients.
  - Add only the configuration you need; avoid speculative abstractions.
- Don’t
  - Don’t introduce new UI libraries or state managers without need.
  - Don’t hardcode server URLs; derive from config/env where present.
  - Don’t restructure the project without explicit direction.

## Common Tasks (Recipes)
- Add a new page
  1) Create component in `frontend/src/pages/`.
  2) Register route in `frontend/src/App.tsx`.
  3) Update navigation if needed.
- Create a new UI component
  1) Start from shadcn/ui patterns.
  2) Apply theme tokens; keep Tailwind classes consistent.
  3) Place in `frontend/src/components/ui/`.
- Modify theme
  1) Edit CSS variables in `frontend/src/index.css`.
  2) Update `tailwind.config.ts` if necessary.
  3) Verify both light and dark modes.
- Fetch data from API
  1) Add a typed client in `frontend/src/api/`.
  2) Use TanStack Query `useQuery`/`useMutation` with proper keys.
  3) Handle loading/empty/error states via reusable UI components.

## Dev Commands
```bash
# Frontend
npm install
npm run dev      # Vite dev server
npm run build
npm run preview
npm run lint

# Backend (example)
python manage.py runserver 8080
```

## API Areas (Reference)
- Auth `/api/auth/`: register, login (JWT), current user.
- Users `/api/users/`: public profile, update profile, upload resume, skills search.
- Opportunities `/api/opportunities/`: list/search, detail, create (hosts), apply.
- Projects `/api/projects/`: dashboard, milestones, forum.
- LMS `/api/lms/`: courses, enroll, my‑courses.

Keep new endpoints consistent with these patterns and update client types accordingly.

## Key Files
- `frontend/src/App.tsx`: route setup.
- `frontend/src/pages/Index.tsx`: landing page.
- `frontend/src/index.css`: theme variables and design system.
- `tailwind.config.ts`: Tailwind customization.
- `frontend/src/components/ui/`: shared UI primitives.

## Quality Bar
- Type safety: export types/interfaces for API payloads; validate inputs with Zod in forms.
- UX: responsive; accessible; consistent spacing, typography, and colors.
- Errors: show clear user feedback; avoid console noise in production builds.

## When In Doubt
- Prefer alignment with `CLAUDE.md` vision and structure.
- Choose the simplest solution that fits the established stack.
- Ask before introducing new tech or large structural changes.

