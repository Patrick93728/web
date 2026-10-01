# Patrick Tomol — Portfolio Website

Patrick Tomol's portfolio is an existing React 19 and Tailwind CSS v4 project. Its content lives in the React components and `src/data/`; the current redesign keeps the existing portfolio sections while replacing the Contact form and inquiry flow.

**Public site:** [website-profile.tomolpatrick.workers.dev](https://website-profile.tomolpatrick.workers.dev/)

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
| Contact API | Node.js server endpoint forwarding validated inquiries to Fruitask |
| Icons | Lucide React, React Icons |
| In-view transitions | react-intersection-observer |
| Project data | Fruitask REST API with local fallback data |
| Checks | oxlint, Vitest, Testing Library |

- `src/App.jsx`: page shell, navigation, and pointer-driven background coordinates.
- `src/index.css`: color tokens, glass surfaces, section layouts, responsive rules, and reduced-motion styles.
- `src/components/`: the visible page sections, theme toggle, project carousel, and image lightbox.
- `src/data/`: services, tech stack, fallback projects, and site links.
- `src/services/fruitask.js`: Fruitask project fetching and data mapping.
- `server/contact.js`: Contact validation and server-only Fruitask row creation.
- `server/index.js`: Node.js HTTP server for `/api/contact` and the production build.
- `src/main.jsx`: applies a saved dark theme before React renders.
- `public/profile.jpg`: profile photo used in the header, About section, and footer.

## Run locally

```bash
npm install
npm run dev
```

`npm run dev` starts Vite and the local contact API together. For a production Node deployment, run `npm run build` and then `npm start`. Route the public `/api/contact` path to this Node server; a static-only deployment cannot process form submissions.

Checks:

```bash
npm run lint
npx vitest run
npm run build
```

`npm run preview` only previews the static build, so its contact form cannot reach the Node API. Use `npm start` to inspect the complete production flow.

## Theme and motion

The theme toggle writes `light` or `dark` to `localStorage`. With no saved preference, the site starts in light mode. Tailwind's dark variant follows the `.dark` class on `<html>`.

The CSS uses short transitions and honors `prefers-reduced-motion`. The scroll-driven desktop project track is disabled for reduced motion; the standard horizontal carousel remains available.

## Fruitask integration

The Projects section tries to load live rows through `src/services/fruitask.js`. If the request fails, returns no projects, or the configuration is absent, it uses `src/data/projects.js`.

The Contact form submits to the same-origin Node endpoint at `/api/contact`. Configure these **server-side** environment variables in a local `.env` file or your Node host:

```env
FRUITASK_API_KEY=your_private_key
FRUITASK_WORKSPACE_TOKEN=your_workspace_token
FRUITASK_TABLE_NAME=your_table_api_name
```

The contact form writes only `Name`, `Email`, `Subject`, and `Message` to the matching Fruitask columns. `Status` and `Date Received` stay managed by the table, so visitors do not fill them in. There is no Budget Range field or column. No Fruitask credential is sent to the React client. Until the server variables are configured, submissions return a clear error and the email and WhatsApp contact links remain available. Live table writes have not been tested without the real credentials.

For local project fetching, the code reads these optional Vite environment variables:

```env
VITE_FRUITASK_API_KEY=your_key
VITE_FRUITASK_TOKEN=your_token
```

Values prefixed with `VITE_` are exposed in the browser bundle. Do not use private or unrestricted credentials there. Local requests may also be blocked by the Fruitask CORS policy; the fallback projects remain available.

The existing project-list integration above is separate from the new contact API. If its `VITE_` values are private credentials, remove them from any client environment and migrate that project fetch to a server endpoint before deploying.
