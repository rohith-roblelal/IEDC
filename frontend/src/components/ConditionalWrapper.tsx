"use client";

import { usePathname } from "next/navigation";

export function ConditionalWrapper({ children, excludePaths }: { children: React.ReactNode, excludePaths: string[] }) {
  const pathname = usePathname();
  const shouldExclude = excludePaths.some(path => pathname?.startsWith(path));

  if (shouldExclude) {
    return null;
  }

  return <>{children}</>;
}
