# PIXCLEAR — AI Image Background Remover

A responsive React/Vite website based on the supplied PIXCLEAR design screenshots. It provides local image upload, real AI background removal, transparent PNG export and Figma-inspired landing, account, dashboard, editor and completion screens.

## Requirements

- Node.js **20.19+** (Node 22 LTS recommended)
- pnpm **11.25.0** (the project pins this in `package.json`)
- An up-to-date browser with WebAssembly and Web Workers enabled

## Install and run

```bash
corepack enable
pnpm install
pnpm dev
```

Open `http://localhost:3000`. Create a production bundle with `pnpm build`; inspect it locally with `pnpm preview`.

## Image processing

- Select or drag in one or more JPG/JPEG, PNG or WEBP images (up to **10 MB per file**).
- The editor calls `@imgly/background-removal` 1.7.0 with ONNX Runtime Web to run a genuine segmentation model in the user's browser.
- The compact quantized ISNet model downloads once on first use (roughly 40 MB) and is then cached by the browser/package. Choose full precision in Dashboard → Settings if preferred.
- PixClear reuses one loaded model module, shows model download progress separately from inference, uses GPU/WebGPU when available, and retries with CPU if GPU processing fails. Queue items remain sequential to limit memory use.
- Uploaded image files are not sent to Firebase or a PIXCLEAR server. The browser fetches model/runtime assets from IMG.LY, so a working connection is needed the first time each model is used.
- A downloadable transparent PNG, interactive original/result slider, hue adjustment and brush-based transparency eraser are included. Multiple images can be queued and processed one at a time.

The included AI package is licensed **AGPL-3.0**. Its full license is served at [`/licenses/IMG-LY-AGPL-3.0.txt`](public/licenses/IMG-LY-AGPL-3.0.txt); source: [IMG.LY background-removal-js](https://github.com/imgly/background-removal-js). AGPL is a copyleft license, including obligations that can apply to a publicly offered modified program. This handoff contains the complete PIXCLEAR project source, but review the package license and your intended deployment before operating a public or closed-source service. No paid AI image-removal API is used. Firebase does use a public web-app API key in the browser configuration; never use a Firebase Admin SDK/service-account key in this frontend. A separate commercial license may be needed if you cannot meet the AGPL terms; no paid license has been purchased for this project.

## Motion

Framer Motion powers short transitions on all six routes, staggered landing-page scroll reveals, animated dashboard panels and stat cards, upload and processing feedback, editor queue/tool/result changes, and a spring-driven before/after comparison handle. The home headline “Remove Image Background In Seconds!” types in one character at a time while retaining the purple emphasis; its complete text is exposed as one accessible heading, and reduced-motion visitors see it immediately. Every native button uses the shared `MotionButton`; router navigation/CTA links use `MotionLink`. Primary CTAs receive a restrained lift/glow on hover and a spring press, while utility controls get a lighter scale/lift response. Reduced-motion visitors skip those transforms, and CSS also respects `prefers-reduced-motion`.

## Accounts and privacy

Accounts use Firebase Authentication email/password sign-up, sign-in, sign-out, session persistence and password-reset emails. Each signed-in user's model preference and download count are stored in their own Firestore profile document. Images, processed results and the current work queue stay in browser memory; image files are not uploaded or saved to Firebase.

Firebase client settings are supplied at build time through Vite environment variables. They are public web-app configuration, not service-account credentials. Copy `.env.example` to `.env.local`, enter the full `VITE_FIREBASE_API_KEY`, and keep `.env.local` out of version control. In the Firebase console, enable **Authentication → Email/Password**, create a **Cloud Firestore** database, and publish the rules in `firestore.rules`. Add the deployed website's host to Firebase Authentication's authorized domains. Production hosting must define the same `VITE_FIREBASE_*` values for its build.

## Implemented routes

| Route | Screen |
| --- | --- |
| `/` | Landing page, examples, Features, How It Works and free browser-edition pricing |
| `/login` | Firebase email/password sign-in and reset email |
| `/signup` | Firebase account creation |
| `/dashboard` | Image statistics, upload, project queue, model preferences and help |
| `/editor` | Background removal, before/after review, eraser, colour adjustment and PNG download |
| `/success` | Successful-download confirmation |

The reference also shows Upscale/Enhance shortcuts. They explain that those advanced operations aren't part of this release rather than claiming to edit the image.

## Project structure

- `src/App.jsx` — router, Firebase auth state, shared image queue and download state.
- `src/pages/` — landing, authentication, dashboard, editor and success screens.
- `src/components/` — reusable PIXCLEAR mark, upload/dropzone, comparison/dialog, and universal Framer Motion button/link primitives.
- `src/lib/account.js` and `src/lib/firebase.js` — Firebase Auth and environment-driven Firebase initialization.
- `src/lib/profile.js` — per-user Firestore profile reads and writes.
- `src/lib/backgroundRemoval.js` — cached model loader, progress reporting and GPU/CPU fallback.
- `firestore.rules` — user-owned profile security rules; `firebase.json` points Firebase CLI at this rules file.
- `.env.example` — public Firebase web configuration template.
- `src/styles.css` — responsive design system, component styles and reduced-motion preferences.
- `public/images/` — user-provided design/reference image assets used in the pages.
- `public/manus-routes.json` — route manifest for the managed preview.
- `pnpm-lock.yaml` — pinned dependency resolution.

## Deployment notes

The app uses Firebase's client SDK; it does not require a custom backend or Firebase Admin/service-account key. Static hosting must serve SPA fallbacks for the routes above, provide the `VITE_FIREBASE_*` values at build time, and allow the model package's browser runtime workers/WASM and model downloads. Use HTTPS and add the published hostname to Firebase Authentication's authorized domains. Cross-origin isolation headers can improve threaded WebAssembly performance, but only enable them after verifying compatibility with Firebase Auth and other cross-origin services. Consult the AGPL notice above before publishing this package as a public service.
