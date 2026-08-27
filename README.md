# SSR App Template

A reusable full-stack TypeScript template for applications that need server-side
rendering. It combines a React Router Framework Mode frontend, a NestJS API, and
a package for types shared between them.

The template intentionally contains no credentials, account identifiers, domain
names, analytics IDs, or application-specific code.

## What is included

- React 19 and React Router 8 with SSR enabled
- Vite 8 and Tailwind CSS 4
- NestJS 11 and Express 5
- Strict TypeScript and npm workspaces
- One production process for the API, static assets, and SSR requests
- Safe-by-default HTTP caching for authenticated and dynamic pages
- A multi-stage production Docker image
- CI and an optional, manually triggered Google Cloud Run workflow

## Repository structure

```text
apps/web                 React Router SSR application
apps/api                 NestJS API and unified production server
packages/shared          Types shared by both applications
.github/workflows        CI and optional deployment automation
```

## Create a project from this template

On GitHub, mark this repository as a template and choose **Use this template**.
Alternatively, clone it and replace its Git history:

```bash
git clone YOUR_TEMPLATE_REPOSITORY_URL my-app
cd my-app
rm -rf .git
git init
npm install
```

Then customize these starter values:

1. Change `name` in the root `package.json`.
2. Replace `SSR Starter` and the metadata in `apps/web/app`.
3. Replace the favicon in `apps/web/public`.
4. Update `PUBLIC_SSR_ROUTES` and `AUTH_COOKIE_NAMES` in
   `apps/api/src/http-cache.middleware.ts` before adding authenticated routes.
5. Delete or configure the optional deployment workflow.

Do not commit `.env` files. The ignore rules allow only `.env.example`.

## Requirements

- Node.js 22.22 or newer
- npm 10.9 or newer

## Local development

```bash
npm install
npm run dev
```

The development services are:

- Web application: http://localhost:5173
- API: http://localhost:3000/api/status
- SSR API example: http://localhost:5173/status

Vite proxies `/api/*` to NestJS. Use `npm run dev:web` or `npm run dev:api`
to start only one side.

## Checks and production builds

Run every local check:

```bash
npm run check
```

Or run the stages separately:

```bash
npm run typecheck
npm test
npm run build
```

Test the combined production server without Docker:

```bash
NODE_ENV=production PORT=3000 npm run start -w @app/api
```

In production, Nest's Express process handles `/api/*`, serves the Vite client
build, and sends all other requests to React Router's SSR request handler.

## Container

```bash
docker build -t my-ssr-app .
docker run --rm -p 8080:8080 -e PORT=8080 my-ssr-app
```

Open http://localhost:8080 and http://localhost:8080/api/status.

## Caching and authentication

The cache middleware applies three policies:

- Hashed `/assets/*` files are public and immutable for one year.
- Anonymous routes explicitly listed in `PUBLIC_SSR_ROUTES` may be cached by a
  shared cache for five minutes.
- API routes, authenticated requests, responses that set cookies, and every
  route not explicitly allowlisted are `private, no-store`.

When adding authentication, keep `AUTH_COOKIE_NAMES` aligned with the cookies
your provider uses. Only add a route to `PUBLIC_SSR_ROUTES` when its complete
rendered response is identical for every anonymous visitor. A CDN must also be
configured to honor the origin's `Cache-Control` header.

## Optional Google Cloud Run deployment

The production workflow is manual by default so a newly cloned repository does
not attempt to deploy. It uses GitHub OIDC and does not require a long-lived
Google Cloud service-account key.

Create a GitHub environment called `production`, configure Workload Identity
Federation for the repository, and add these environment variables:

| Variable | Purpose |
| --- | --- |
| `GCP_PROJECT_ID` | Google Cloud project ID |
| `GCP_REGION` | Cloud Run and Artifact Registry region |
| `ARTIFACT_REGISTRY_REPOSITORY` | Docker repository name |
| `CLOUD_RUN_SERVICE` | Cloud Run service and image name |
| `GCP_WIF_PROVIDER` | Workload Identity provider resource name |
| `GCP_WIF_SERVICE_ACCOUNT` | Deployer service-account email |

The deployer needs enough access to push to Artifact Registry, deploy Cloud Run,
and act as the Cloud Run runtime service account. Review these permissions for
your own organization before enabling automatic deployments. Once configured,
run **Deploy production** from GitHub Actions. Add a `push` trigger only when
you are ready for automatic releases.

## Useful next additions

- Runtime environment validation
- A database package and migrations
- Authentication and CSRF protection
- Request logging and error reporting
- Route-level tests for application behavior
- A deployment strategy tailored to your hosting provider
