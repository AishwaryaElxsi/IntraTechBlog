import React, { createContext, useReducer, useContext } from "react";
import { initialData, dataReducer } from "./blogData";

// Set up context
const BlogContext = createContext();

// PUBLIC_INTERFACE
export const BlogProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialData);

  // PUBLIC_INTERFACE
  const login = (username, password) => {
    // Basic mock user lookup
    const user = state.users.find(
      (u) => u.username === username && u.password === password
    );
    if (user) {
      dispatch({ type: "LOGIN", user });
      return { success: true };
    }
    return { success: false, error: "Invalid credentials" };
  };

  // PUBLIC_INTERFACE
  const logout = () => dispatch({ type: "LOGOUT" });

  // PUBLIC_INTERFACE
  const register = (userData) => {
    const exists = state.users.some((u) => u.username === userData.username);
    if (exists) return { success: false, error: "Username already exists" };
    dispatch({ type: "REGISTER", user: userData });
    return { success: true };
  };

  // PUBLIC_INTERFACE
  // Add additional action handlers as needed (posts, comments, likes, etc.)

  return (
    <BlogContext.Provider value={{ state, dispatch, login, logout, register }}>
      {children}
    </BlogContext.Provider>
  );
};

// PUBLIC_INTERFACE
export const useBlogContext = () => useContext(BlogContext);
