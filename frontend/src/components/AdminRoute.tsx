import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null); // null = loading

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAdmin(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setIsAdmin(data.role === "admin");
      } catch (err) {
        setIsAdmin(false);
      }
    };

    fetchProfile();
  }, []);

  if (isAdmin === null) return <p>Loading...</p>;
  if (!isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default AdminRoute;
