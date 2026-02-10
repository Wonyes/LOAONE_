"use client";

import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/getQueryClient";
import { supabase } from "@/lib/supabase/client/client"; // 싱글톤 클라이언트
import { useAuthStore } from "@/hooks/store/useAuthStore";

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    // [추가] 앱이 켜질 때 딱 한 번 실행되는 유저 감시 로직
    const initAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // 로그인/로그아웃 상태 변화 리슨
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
