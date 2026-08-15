"use client";

import { ModelProvider } from "@/components/ModelProvider";
import { PasswordGate } from "@/components/PasswordGate";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <PasswordGate>
      <ModelProvider>{children}</ModelProvider>
    </PasswordGate>
  );
}
