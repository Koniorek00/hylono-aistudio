import type { ReactNode } from 'react';

interface MainShellProps {
  children: ReactNode;
}

export function MainShell({ children }: MainShellProps) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="relative z-0 w-full max-w-[100vw] min-w-0 overflow-x-clip focus:outline-none"
    >
      {children}
    </main>
  );
}
