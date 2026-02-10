// src/store/useFavoriteStore.ts
import { create } from "zustand";

interface FavoriteCharacter {
  name: string;
  serverName?: string;
  itemLevel?: string;
  className?: string;
}

interface FavoriteStore {
  favorites: FavoriteCharacter[];
  setFavorites: (characters: FavoriteCharacter[]) => void;
  toggleFavoriteStore: (character: FavoriteCharacter) => void;
  isFavorite: (name: string) => boolean;
}

export const useFavoriteStore = create<FavoriteStore>((set, get) => ({
  favorites: [],
  setFavorites: favorites => set({ favorites }),

  toggleFavoriteStore: character =>
    set(state => {
      const exists = state.favorites.some(f => f.name === character.name);
      if (exists) {
        return {
          favorites: state.favorites.filter(f => f.name !== character.name),
        };
      }
      return { favorites: [...state.favorites, character] };
    }),

  isFavorite: name => get().favorites.some(f => f.name === name),
}));
