import { create } from "zustand";
import axios from "../lib/axios.js";
import { toast } from "react-hot-toast";




export const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  checkingAuth: true,

  signup: async ({ name, email, password, confirmPassword }) => {
    set({ loading: true });

    if (password !== confirmPassword) {
      set({ loading: false });
      return toast.error("Passwords do not match!");
    }

    try {
      const res = await axios.post("/auth/signup", { name, email, password });
      set({ user: res.data.user, loading: false });
      toast.success("Signup successful!");
    } catch (error) {
      console.log("Signup error:", error);
      set({ loading: false });
      toast.error(
        error.response?.data?.message ||
          "An error occurred while signing up. Please try again!"
      );
    }
  },


    login: async ({  email, password }) => {
    set({ loading: true });

    try {
      const res = await axios.post("/auth/login", { email, password });
      set({ user: res.data, loading: false });
      toast.success("Login successful!");
    } catch (error) {
      console.log("Signup error:", error);
      set({ loading: false });
      toast.error(
        error.response?.data?.message ||
          "An error occurred while logging in, Please try again!"
      );
    }
  },


  checkAuth: async () => {
  set({ checkingAuth: true });
  try {
    const res = await axios.get("/auth/profile", {withCredentials: true});
    set({ user: res.data, checkingAuth: false });
    console.log("Authenticated user:", res.data);
  } catch (error) {
    set({ checkingAuth: false, user: null, error:error }); 
  }
},


  logout: async () => {
		try {
			await axios.post("/auth/logout");
			set({ user: null });
		} catch (error) {
			toast.error(error.response?.data?.message || "An error occurred during logout");
		}
	},
}));
