'use client';

import { PROGRESS_BAR_COLOR } from '@/config/color';
import { ProgressProvider } from '@bprogress/next/app';

export default function ProgressBarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProgressProvider
      height="4px"
      color={PROGRESS_BAR_COLOR}
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </ProgressProvider>
  );
}
