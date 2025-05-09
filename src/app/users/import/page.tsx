"use client";

import Papa, { ParseResult } from "papaparse";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ImportStudents() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setLoading(true);
    Papa.parse<Record<string, string>>(e.target.files[0], {
      header: true,
      complete: async (results: ParseResult<Record<string, string>>) => {
        await fetch("/api/users/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(results.data),
        });
        setLoading(false);
        router.push("/users");
      },
    });
  };

  return (
    {/* ... */}
  );
}
