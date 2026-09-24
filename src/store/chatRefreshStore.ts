import { create } from "zustand";

interface ChatRefreshState {
  refreshKey: number;
  bumpRefresh: () => void;
}

export const useChatRefreshStore = create<ChatRefreshState>((set) => ({
  refreshKey: 0,
  bumpRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
}));