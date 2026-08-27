import type { ApiStatus } from "@app/shared";
import type { Route } from "./+types/status";

export function meta({}: Route.MetaArgs) {
  return [{ title: "API Status | SSR App Starter" }];
}

export async function loader({ request }: Route.LoaderArgs): Promise<ApiStatus> {
  const apiOrigin =
    process.env.NODE_ENV === "production"
      ? `http://127.0.0.1:${process.env.PORT ?? 3000}`
      : request.url;
  const response = await fetch(new URL("/api/status", apiOrigin), {
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new Response("The API status request failed.", {
      status: response.status,
      statusText: response.statusText,
    });
  }

  return (await response.json()) as ApiStatus;
}

export default function Status({ loaderData }: Route.ComponentProps) {
  return (
    <section>
      <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">
        End-to-end example
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
        API status
      </h1>
      <dl className="mt-8 grid max-w-md grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <dt className="text-slate-500">Status</dt>
        <dd className="font-medium text-emerald-700">{loaderData.status}</dd>
        <dt className="text-slate-500">Service</dt>
        <dd className="font-medium text-slate-950">{loaderData.service}</dd>
      </dl>
    </section>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const message =
    error instanceof Error ? error.message : "The API is currently unavailable.";

  return (
    <section role="alert">
      <h1 className="text-4xl font-semibold text-slate-950">API unavailable</h1>
      <p className="mt-4 text-red-700">{message}</p>
    </section>
  );
}
