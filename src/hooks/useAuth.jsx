import { useEffect, useState } from "react";

const useAuth = () => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("client");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("client_token"));

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem("client");
      const token = localStorage.getItem("client_token");

      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    };

    checkAuth();

    // Listen for changes in localStorage (e.g., login/logout events)
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  return { user, isLoggedIn, isAdmin: user?.role === "admin" || user?.role === "manager" };
};

export default useAuth;