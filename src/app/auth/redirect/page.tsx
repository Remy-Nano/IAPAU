"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function RedirectPage() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      signIn("credentials", {
        token,
        redirect: false,
      }).then((res) => {
        if (res?.ok) {
          router.push("/dashboard/student");
        } else {
          router.push("/login");
        }
      });
    } else {
      router.push("/login");
    }
  }, [params, router]);

  return <p>Connexion en cours...</p>;
}
