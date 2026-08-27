import { Link } from "react-router";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "SSR App Starter" },
    {
      name: "description",
      content:
        "A production-ready starting point for a server-rendered TypeScript app.",
    },
  ];
}

export default function Home() {
  return (
    <section>
      <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">
        SSR Template
      </p>
      <h1 className="mt-4 max-w-4xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-7xl">
        Accelerate your next server-rendered app.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
        Simple monorepo to accelerate setup for server-side rendered React apps
        with a typed API, DTOs, sensible cache controls, with container-based
        deployment and optional Google Cloud setup.
      </p>
      <ul className="mt-8 grid max-w-5xl list-disc gap-x-10 gap-y-2 pl-5 text-slate-700 [&_strong]:block md:grid-cols-3">
        <li>
          <strong className="font-medium text-slate-950">React 19</strong>
          Interactive, component-based framework for user interfaces.
        </li>
        <li>
          <strong className="font-medium text-slate-950">
            React Router 8 with SSR
          </strong>{" "}
          Routing, data loading, and server-side rendering.
        </li>
        <li>
          <strong className="font-medium text-slate-950">Vite 8</strong>
          Fast development server with hot reload, and optimized builds.
        </li>
        <li>
          <strong className="font-medium text-slate-950">Tailwind CSS 4</strong>{" "}
          Rapid, consistent styling with utility classes.
        </li>
        <li>
          <strong className="font-medium text-slate-950">NestJS 11</strong>
          Modular, testable backend application structure.
        </li>
        <li>
          <strong className="font-medium text-slate-950">Express 5</strong>
          Serves the API, static assets, and rendered pages together for simple
          deployments.
        </li>
        <li>
          <strong className="font-medium text-slate-950">TypeScript 6</strong>
          Strict, end-to-end type safety
        </li>
        <li>
          <strong className="font-medium text-slate-950">npm workspaces</strong>{" "}
          Web app, API, and shared package in one repository with share node
          modules.
        </li>
        <li>
          <strong className="font-medium text-slate-950">Node.js 22.22</strong>{" "}
          Stable, modern JavaScript production runtime for the backend.
        </li>
        <li>
          <strong className="font-medium text-slate-950">Docker</strong>
          Packages the entire application into a portable image.
        </li>
        <li>
          <strong className="font-medium text-slate-950">GitHub Actions</strong>{" "}
          CI/CD validates every push and pull request.
        </li>
        <li>
          <strong className="font-medium text-slate-950">
            Google Cloud Run
          </strong>{" "}
          Runs the build as a container on managed cloud infrastructure.
        </li>
      </ul>
      <div className="pt-32 mb-12 flex flex-wrap justify-center gap-4">
        <Link
          className="rounded-md bg-blue-700 px-5 py-3 font-medium text-white hover:bg-blue-800 hover:text-white"
          to="/status"
        >
          Check the API Status
        </Link>
      </div>
    </section>
  );
}
