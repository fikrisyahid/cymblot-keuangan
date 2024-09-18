'use client';

import { PROGRESS_BAR_COLOR } from '@/config/color';
import { AppProgressBar } from 'next-nprogress-bar';

export default function ProgressBar() {
  return (
    <AppProgressBar
      height="4px"
      color={PROGRESS_BAR_COLOR}
      options={{ showSpinner: false }}
      shallowRouting
    />
  );
}
