/** Celebration burst for finishing a book. Skipped when the device asks for less motion. */
export const prefersReducedMotion = () =>
  typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export async function celebrate() {
  if (typeof window === "undefined" || prefersReducedMotion()) return;
  const confetti = (await import("canvas-confetti")).default;
  const colors = ["#d97757", "#2f7f7a", "#e8b04b", "#f5ede1"];
  confetti({ particleCount: 90, spread: 70, startVelocity: 45, origin: { y: 0.7 }, colors });
  window.setTimeout(() => confetti({ particleCount: 60, spread: 100, origin: { x: 0.2, y: 0.6 }, colors }), 180);
  window.setTimeout(() => confetti({ particleCount: 60, spread: 100, origin: { x: 0.8, y: 0.6 }, colors }), 320);
}
