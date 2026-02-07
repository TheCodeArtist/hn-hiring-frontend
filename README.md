# HN Hiring Scanner

Quickly research **HN "Who's hiring?"** job postings with advanced filtering and side-by-side comparision.


## Features

- Sort/filter by company, location, remote policy, job title, visa sponsorship, ...
- Tech-stack filter with boolean logic support (eg. `Python AND (React OR Angular)`, `C AND NOT C++`)
- Light/dark theme, WCAG AA compliant
- Side-by-side job comparison tool with differences/commons highlighted.


## Setup

```bash
make install          # Install dependencies
make dev              # Start dev server (port 4200)
make build            # Build for production. Output: `dist/hn-hiring-frontend/browser/`
```

See `Makefile` for all commands.


## Local Development

1. **Install dependencies**
   ```bash
   make install
   ```

2. **Start dev server**
   ```bash
   make dev
   ```
   Opens at `http://localhost:4200` with hot reload

3. **View locally**
   - Navigate to `http://localhost:4200`
   - App loads sample data from `public/jobs.json`
   - Make changes in `src/` - auto-reloads

4. **Debug**
   - Open browser DevTools (F12)
   - Source maps enabled for debugging TypeScript
   - Angular DevTools extension recommended
