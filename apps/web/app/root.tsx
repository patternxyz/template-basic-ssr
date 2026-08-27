import type { ReactNode } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation,
} from "react-router";
import type { Route } from "./+types/root";
import "./styles.css";

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
];

export function loader() {
  return { renderedAt: new Date().toISOString() };
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  const navigation = useNavigation();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white/90">
        <div className="mx-auto flex max-w-6xl items-center justify-end px-6 py-12">
          <nav aria-label="Main navigation" className="flex gap-5 text-sm">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/status">API status</NavLink>
          </nav>
        </div>
      </header>
      {navigation.state !== "idle" && (
        <div className="h-0.5 animate-pulse bg-blue-600" role="status">
          <span className="sr-only">Loading</span>
        </div>
      )}
      <main className="mx-auto w-full max-w-6xl flex-1 px-12 py-16">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-6 text-sm text-slate-500">
          <p className="pt-1">
            Repository Maintained by{" "}
            <span className="font-medium text-slate-700">Pattern X</span>.
          </p>
        </div>
      </footer>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let title = "Something went wrong";
  let message = "The page could not be loaded.";

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    message = typeof error.data === "string" ? error.data : message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold text-slate-950">{title}</h1>
      <p className="mt-3 text-slate-600">{message}</p>
      <NavLink className="mt-6 inline-block text-blue-700 underline" to="/">
        Return home
      </NavLink>
    </main>
  );
}
