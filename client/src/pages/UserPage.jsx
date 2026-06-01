import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";

const API = import.meta.env.VITE_BACKEND_URL;

const UserPage = () => {
  const [cookies] = useCookies(["token"]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${API}/user/profile`, {
          headers: { Authorization: `Bearer ${cookies.token}` }
        });
        setUser(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, [cookies.token]);

  return (
    <div>
      <h1>User Profile</h1>
      {user && (
        <div>
          <img src={`${API}/${user.profileImage}`} alt={user.name} width="100" />
          <p>{user.name}</p>
        </div>
      )}
    </div>
  );
};

export default UserPage;