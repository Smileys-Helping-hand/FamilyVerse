"use client";

import React from "react";

/**
 * Global Providers Wrapper
 * Auth is handled by Firebase via AuthContext (see context/AuthContext.tsx)
 * Admin access is controlled via Firebase email cookie + middleware
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
