"use client";

import { useEffect, useLayoutEffect } from "react";

/** useLayoutEffect that no-ops to useEffect during SSR, avoiding React's dev warning. */
export const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
