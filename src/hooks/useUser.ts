// src/hooks/useUser.ts

import { useAuthStore } from "./store/useAuthStore";

export function useUser() {
  const { user, loading } = useAuthStore();

  return { user, loading };
}
