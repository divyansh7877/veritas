# Project Rules

## Architecture

### Monorepo Structure
```
veritas/
├── app/              # Python FastAPI backend
├── web/              # Next.js 16 frontend
├── package.json      # Root with npm workspaces
├── turbo.json        # Turborepo config
├── CLAUDE.md         # This file
├── pyproject.toml    # Python dependencies
└── uv.lock          # Python lock file
```

### Tech Stack
- **Frontend**: Next.js 16 with App Router, Tailwind CSS v4, shadcn/ui (base-ui), lucide-react
- **Backend**: Python FastAPI
- **Build**: Turborepo, npm workspaces

## Frontend Rules

### Styling & Theme
- Use Tailwind CSS v4 with `@theme` directive for custom colors/fonts
- Use shadcn/ui components - run `npx shadcn@latest add <component> -y` to add
- **Never use inline Tailwind color values** - always use CSS variables from the theme
- **Never use !important** to override component styles
- Use CSS variables: `--primary`, `--secondary`, `--muted`, `--destructive`, `--border`, `--background`, `--foreground`, `--accent`, `--ring`, `--card`, `--popover`

### Theme Colors (CSS Variables)
| Variable | Light Mode | Dark Mode |
|----------|------------|-----------|
| `--primary` | #031635 | #d8e2ff |
| `--secondary` | #006c49 | #6cf8bb |
| `--background` | #f7f9fb | #191c1e |
| `--foreground` | #191c1e | #f7f9fb |
| `--muted` | #f2f4f6 | #2d3133 |
| `--destructive` | #ba1a1a | #ffdad6 |
| `--border` | #c5c6cf | #44474e |
| `--card` | #ffffff | #1a2b4b |

### Icons
- **Use lucide-react** for all icons - never use Material Symbols or emoji
- Import icons directly: `import { Search, HelpCircle } from "lucide-react"`
- Use `h-4 w-4` or `h-5 w-5` for icon sizes (Tailwind default)

### Components
- Use shadcn/ui components for UI elements (Button, Input, Card, Badge, Progress, Label)
- Use `"use client"` directive for client-side interactivity
- Use Next.js `<Link>` from `next/link` for client-side navigation (not `<a>`)
- Use proper `htmlFor` attribute on labels, not `for`

### File Organization
- App Router pages: `web/src/app/page.tsx` and `web/src/app/[route]/page.tsx`
- shadcn components: `web/src/components/ui/`
- Custom components: `web/src/components/`
- Utilities: `web/src/lib/utils.ts` (contains `cn()` function from tailwind-merge + clsx)

### Build & Dev Commands
- `npm run dev` - Start development server (from root uses Turbo)
- `npm run build` - Production build
- `cd web && npm run dev` - Run Next.js dev server directly

## Backend Rules

### Python
- Use FastAPI with Pydantic for schemas
- Use `python-dotenv` for environment variables
- API endpoints in `app/api/`
- Services in `app/services/`
- Agents in `app/agents/`

## Git Rules

### .gitignore
The following must be ignored:
- `node_modules/` (and `web/node_modules/`)
- `.env` (secrets)
- `__pycache__/`, `*.py[cod]`, `*.egg-info/`
- `.DS_Store`, `*.log`
- `.web/` (Vercel build output)
- `venv/`, `.venv/`

## Adding Components

### Adding shadcn/ui Components
```bash
cd web
npx shadcn@latest add button input card progress badge -y
```

### Adding New Pages
1. Create `web/src/app/[route]/page.tsx`
2. Add `"use client"` if using interactivity
3. Import shadcn components from `@/components/ui/[component]`
4. Import icons from `lucide-react`

## Dependencies

### Frontend (web/)
- next@16
- react, react-dom
- tailwindcss@4
- shadcn/ui (base-ui)
- lucide-react
- @base-ui/react (underlying component library)

### Backend (app/)
- fastapi
- uvicorn
- pydantic, pydantic-settings
- python-dotenv
- ai-sdk-python
- httpx

## Environment Variables

See `.env.example` for required variables. Never commit `.env` with actual secrets.
