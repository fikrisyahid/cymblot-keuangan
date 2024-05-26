"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const redirectScript = setInterval(() => {
      router.push("/dashboard");
    }, 100);

    return () => {
      clearInterval(redirectScript);
    };
  }, [router]);

  return <></>;
}
