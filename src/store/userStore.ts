// import { create } from "zustand";
// import { persist } from "zustand/middleware";
// import type { Session, User } from "@supabase/supabase-js";

// type UserState = {
//   user: User | null;
//   session: Session | null;
//   setSession: (session: Session | null) => void;
//   setUser: (user: User | null) => void;
//   logout: () => void;
// };

// export const useUserStore = create<UserState>()(
//   persist(
//     (set) => ({
//       user: null,
//       session: null,
//       setSession: (session) => set({ session }),
//       setUser: (user) => set({ user }),
//       logout: () => set({ user: null, session: null }),
//     }),
//     { name: "user-storage" } // сохранит в localStorage
//   )
// );
