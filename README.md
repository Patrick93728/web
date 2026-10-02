# Patrick Tomol — Portfolio Website

Patrick Tomol's portfolio is an existing React 19 and Tailwind CSS v4 project. Its content lives in the React components and `src/data/`; the current redesign keeps the existing portfolio sections while replacing the Contact form and inquiry flow.

**Public site:** [web.tomolpatrick.workers.dev](https://web.tomolpatrick.workers.dev/)

Local edits do not appear on the public site until they are deployed.

## Current website

The page has a sticky navigation bar followed by Home, Services, My Projects, About Me, Tech Stack, Contact, and a footer.

- **Visual style:** A restrained grayscale interface with light mode as the default and a saved dark-mode preference. Text and page surfaces follow the selected theme; profile and project photos and technology icons keep their original colors.
- **Typography:** Poppins is used for body and interface text; Kripa is used for the hero and section headings. Both load from Google Fonts with system-font fallbacks.
- **Landing preloader:** Random letters resolve into “Patrick Tomol,” then a short full-screen curtain exit reveals the page. The animation is skipped when reduced motion is requested.
- **Header:** A translucent, blurred glass bar in both themes. The cursor-reactive dot overlay is excluded from the header so dots do not appear inside the menu.
- **Background interaction:** The hero has a subtle cursor-reactive dot field. Other section and footer dot treatments respond to pointer movement where supported. Motion is reduced when the visitor requests it.
- **Services:** Simple, readable cards show each service description and its included deliverables without an expand/collapse control.
- **Projects:** The selected-projects track moves horizontally as the visitor scrolls on sufficiently large desktop viewports. Smaller viewports use a horizontally scrollable carousel with previous/next controls. Project images open a lightbox with arrow-key and Escape support.
- **About Me:** The original introduction, “How I Add Value” list, and resume link remain. The portrait uses a compact rectangular card, vertically centered in the desktop About panel and shifted slightly toward the right. It is centered without that offset on mobile.
- **Tech Stack:** Tools are grouped into consistent cards with individual technology labels.
- **Contact:** A two-column project inquiry section with email and WhatsApp contact methods and a glass form card. On mobile, the intro and form stack vertically.
- **Footer:** A rounded, bordered panel containing the profile, social links, copyright text, and Back to top button.

The layout adapts to desktop, tablet, and mobile widths. Links and controls retain visible focus states.

## Tech stack and source files

| Area | Current implementation |
|---|---|
| UI | React 19, Tailwind CSS v4 |
| Build | Vite 8 |
| Contact API | Node.js locally and a Cloudflare Worker in production, forwarding validated inquiries to Fruitask |
| Icons | Lucide React, React Icons |
| In-view transitions | react-intersection-observer |
| Project data | Server-side Fruitask REST API with the existing project list as a fallback |
| Checks | oxlint, Vitest, Testing Library |

- `src/App.jsx`: page shell, navigation, and pointer-driven background coordinates.
- `src/index.css`: color tokens, glass surfaces, section layouts, responsive rules, and reduced-motion styles.
- `src/components/`: the visible page sections, theme toggle, project carousel, and image lightbox.
- `src/data/`: services, tech stack, site links, and the existing project list used when the API is unavailable.
- `src/services/fruitask.js`: same-origin project fetching without browser credentials.
- `server/projects.js`: private Fruitask project fetching and display-data mapping.
- `server/contact.js`: Contact validation and server-only Fruitask row creation.
- `server/index.js`: Node.js HTTP server for `/api/contact`, `/api/projects`, and the production build.
- `worker/index.js`: Cloudflare Worker routes for `/api/contact` and `/api/projects`, with static assets served from `dist/`.
- `wrangler.jsonc`: Cloudflare Worker deployment and static asset routing.
- `src/main.jsx`: applies a saved dark theme before React renders.
- `public/profile.jpg`: profile photo used in the header, About section, and footer.

## Run locally

```bash
npm install
npm run dev
```

`npm run dev` starts Vite and the local contact API together. For a production Node deployment, run `npm run build` and then `npm start`. Cloudflare Workers uses `worker/index.js` for the same `/api/contact` path.

Checks:

```bash
npm run lint
npx vitest run
npm run test:contact
npm run test:projects
npm run test:worker
npm run build
```

`npm run preview` only previews the static build, so its contact form cannot reach the Node API. Use `npm start` to inspect the complete local production flow.

## Deploy to Cloudflare Workers

The Wrangler CLI is pinned in `package-lock.json`, and `wrangler.jsonc` deploys the Vite build plus the API Worker under the `web` Worker name used by the public URL. Cloudflare Workers Builds should use `npm run build` as the build command and `npx wrangler deploy` as the deploy command. The equivalent local commands are:

```bash
npm ci
npm run build
npx wrangler deploy
```

Before using live Contact and Projects data, add `FRUITASK_API_KEY`, `FRUITASK_WORKSPACE_TOKEN`, and `FRUITASK_PROJECTS_WORKSPACE_TOKEN` as **runtime secrets** on the `web` Worker in Cloudflare's Variables and Secrets settings. Add `FRUITASK_TABLE_NAME` there as a runtime variable with the exact Contact table API name. The local `.env` is ignored by Git and is not deployed. If Projects bindings are missing, `/api/projects` returns 503 and the page shows the existing projects from `src/data/projects.js`; if Contact bindings are missing, the Worker returns a configuration error to the form without exposing credentials. Do not put credentials in Cloudflare build variables or `wrangler.jsonc`.

## Theme and motion

The theme toggle writes `light` or `dark` to `localStorage`. With no saved preference, the site starts in light mode. Tailwind's dark variant follows the `.dark` class on `<html>`.

The CSS uses short transitions and honors `prefers-reduced-motion`. The scroll-driven desktop project track is disabled for reduced motion; the standard horizontal carousel remains available.

## Fruitask integration

The Projects section loads display-only project data from the same-origin `/api/projects` route on each page load. The request bypasses the browser cache, and API responses use `Cache-Control: no-store`. The Node server and Cloudflare Worker call Fruitask with private credentials. Repository links are not included in the API response or shown on project cards; Live Demo remains the only project action. If the request fails, the existing four project cards from `src/data/projects.js` remain visible with their existing Live Demo links.

The Contact form submits to the same-origin `/api/contact` endpoint, served by Node.js locally or the Worker on Cloudflare. Configure these **server-side** environment variables in a local `.env` file, your Node host, or the Cloudflare Worker's runtime settings:

```env
FRUITASK_API_KEY=your_private_key
FRUITASK_WORKSPACE_TOKEN=your_workspace_token
FRUITASK_TABLE_NAME=your_table_api_name
FRUITASK_PROJECTS_WORKSPACE_TOKEN=your_projects_workspace_token
```

The contact form writes `Name`, `Email`, `Subject`, and `Message` to the matching Fruitask columns. The server also writes `Date Received` as the submission date in Philippine time; visitors do not fill it in. `Status` stays managed by the table. There is no Budget Range field or column. No Fruitask credential is sent to the React client. Until the server variables are configured, submissions return a clear error and the email and WhatsApp contact links remain available. Live table writes have not been tested without creating a real inquiry.

The Projects and Contact workspace tokens can differ. Neither token nor the API key is read by the React frontend. Rotate any credentials previously deployed in `VITE_` variables, since older browser bundles may still contain them.
