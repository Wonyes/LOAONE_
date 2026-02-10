import { useUser } from "@/hooks/useUser";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFavoriteStore } from "@/hooks/store/useFavoriteStore";

// 전체 즐겨찾기 목록 조회
export function useFavorites() {
  const { user } = useUser();
  const setFavorites = useFavoriteStore(state => state.setFavorites);

  return useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      const res = await fetch("/api/favorites/list");

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();

      const favorites = data.favorites || [];

      setFavorites(favorites);

      return favorites;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });
}

// 개별 즐겨찾기 상태 조회
export function useFavoriteStatus(characterName: string) {
  const { user } = useUser();
  const isFavorite = useFavoriteStore(state => state.isFavorite);

  return useQuery({
    queryKey: ["favorite", characterName, user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/favorites?name=${characterName}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!user && !!characterName,
    staleTime: 1000 * 60,
    select: data => ({
      ...data,
      cachedFavorite: isFavorite(characterName),
    }),
  });
}

// 즐겨찾기 토글

export function useToggleFavorite(characterName: string) {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const toggleFavoriteStore = useFavoriteStore(
    state => state.toggleFavoriteStore
  );

  return useMutation({
    mutationFn: async (data: {
      characterName: string;
      serverName: string;
      itemLevel: string;
      className: string;
    }) => {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to toggle");
      return res.json();
    },

    onMutate: async variables => {
      await queryClient.cancelQueries({
        queryKey: ["favorite", characterName, user?.id],
      });
      await queryClient.cancelQueries({ queryKey: ["favorites", user?.id] });

      const previousFavorites = [...useFavoriteStore.getState().favorites];

      toggleFavoriteStore({
        name: characterName,
        serverName: variables.serverName,
        itemLevel: variables.itemLevel,
        className: variables.className,
      });

      return { previousFavorites };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousFavorites) {
        useFavoriteStore.getState().setFavorites(context.previousFavorites);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["favorite", characterName, user?.id],
      });
      queryClient.invalidateQueries({ queryKey: ["favorites", user?.id] });
    },
  });
}
