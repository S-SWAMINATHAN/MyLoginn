import type { ReactNode } from "react";

/**
 * The site always renders in the light theme. The root layout sets data-theme="light" (and color-scheme) on <html>
 * in the server HTML, so no theme script is needed. next-themes used to do this with an inline <script>, which
 * React 19 reports as "Encountered a script tag while rendering React component" whenever the tree re-renders.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
