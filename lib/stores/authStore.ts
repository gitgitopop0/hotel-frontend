import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
    id: number
    email: string
    username: string
    role: "admin" | "user"
}

interface AuthStore {
    user: User | null
    setUser: (user: User) => void
    clearUser: () => void
    isAdmin: () => boolean
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            setUser: (user) => set({ user }),
            clearUser: () => set({ user: null }),
            isAdmin: () => get().user?.role === "admin",
        }),
        {
            name: "auth-user",
            partialize: (state) => ({ user: state.user }),
        }
    )
)