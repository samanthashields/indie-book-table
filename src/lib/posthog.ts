import posthog from "posthog-js";

let initialized = false;

/**
 * Initialize PostHog once, browser-only. If the connector token isn't
 * linked (e.g. local dev), analytics silently stays off.
 */
export function initPostHog() {
  if (initialized || typeof window === "undefined") return;
  const token = import.meta.env["VITE_LOVABLE_CONNECTOR_POSTHOG_API_KEY"] as
    | string
    | undefined;
  if (!token) return;
  const region = (import.meta.env["VITE_LOVABLE_CONNECTOR_POSTHOG_REGION"] as
    | string
    | undefined) ?? "us";
  const apiHost =
    region === "eu" ? "https://eu.i.posthog.com" : "https://us.i.posthog.com";
  posthog.init(token, {
    api_host: apiHost,
    // SPA: pageviews are captured manually on router navigation (see __root.tsx).
    capture_pageview: false,
    capture_pageleave: true,
  });
  initialized = true;
  (window as unknown as { posthog?: unknown }).posthog = posthog; // TEMP debug
}

export function capturePageview(url: string) {
  if (!initialized) return;
  posthog.capture("$pageview", { $current_url: url });
}

export function captureEvent(
  event: string,
  properties?: Record<string, unknown>,
) {
  if (!initialized) return;
  posthog.capture(event, properties);
}
