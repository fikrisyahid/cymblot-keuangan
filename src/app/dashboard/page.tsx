import MainCard from "@/components/main-card";
import Welcome, { WelcomeSkeleton } from "./welcome";
import { Suspense } from "react";

export default function Page() {
  return (
    <MainCard>
      <Suspense fallback={<WelcomeSkeleton />}>
        <Welcome />
      </Suspense>
    </MainCard>
  );
}
