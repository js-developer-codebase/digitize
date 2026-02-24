import { create } from 'zustand';

export type NavType = 'WORK' | 'DISTRICT' | 'RO';

export interface NavPathItem {
    id: string;
    name: string;
    type: NavType;
    data?: any;
}

interface NavigationState {
    currentLevel: number;
    path: NavPathItem[];
    pushToPath: (item: NavPathItem) => void;
    popPath: () => void;
    jumpToLevel: (index: number) => void;
    reset: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
    currentLevel: 0,
    path: [],
    pushToPath: (item) =>
        set((state) => ({
            path: [...state.path, item],
            currentLevel: state.currentLevel + 1,
        })),
    popPath: () =>
        set((state) => {
            if (state.path.length === 0) return state;
            const newPath = [...state.path];
            newPath.pop();
            return {
                path: newPath,
                currentLevel: Math.max(0, state.currentLevel - 1),
            };
        }),
    jumpToLevel: (index) =>
        set((state) => {
            const newPath = state.path.slice(0, index + 1);
            return {
                path: newPath,
                currentLevel: index + 1,
            };
        }),
    reset: () => set({ currentLevel: 0, path: [] }),
}));
