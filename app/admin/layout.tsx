"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session) {
        router.replace("/");
        router.refresh();
        return;
      }

      setIsChecking(false);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.replace("/");
        router.refresh();
      }
    });

    const handlePageShow = () => {
      checkSession();
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [router]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-200 text-sm text-gray-500">
        <span className="loading loading-spinner loading-sm mr-2" />
        Checking access...
      </div>
    );
  }

  return (
    <div>
      {children}
    </div>
  )
}