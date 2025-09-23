import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default function PrdLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
