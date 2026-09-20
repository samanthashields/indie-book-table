export type ThemePref = "light" | "dark" | "system";

const KEY = "theme";

export function getThemePref(): ThemePref {
  try {
    const v = localStorage.getItem(KEY);
    return v === "dark" || v === "system" ? v : "light";
  } catch {
    return "light";
  }
}

export function applyTheme(pref: ThemePref) {
  try {
    localStorage.setItem(KEY, pref);
  } catch {
    /* storage can be blocked; the class below still applies for this visit */
  }
  const dark = pref === "dark" || (pref === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

/** Runs before first paint so the page never flashes the wrong theme. */
export const themeInitScript = `(function(){try{var p=localStorage.getItem("theme");var d=p==="dark"||(p==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;
