import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";

const API = import.meta.env.VITE_BACKEND_URL;

const AdminPage = () => {
  const [cookies] = useCookies(["token"]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API}/auth/users`, {
          headers: { Authorization: `Bearer ${cookies.token}` }
        });
        setUsers(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, [cookies.token]);

  return (
    <div style={{backgroundColor:'white', padding:'10px'}}>
      <h1>Admin Dashboard</h1>
      <div style={{display:'flex', gap:'5px', fontWeight:'500'}}>
        <span>Total User</span>
        <span>{users.length}</span>
      </div>
      <h2>All Users</h2>
      <table border='1' style={{textAlign:'center'}}>
        <tr>
          <th>ID</th>
          <th>Username</th>
          <th>Role</th>
          <th>Total Saved Recipe</th>
          <th>Action</th>
        </tr>
        {users.map(user => (
          <tr key={user._id}>
            <td>{user._id}</td>
            <td>{user.username}</td>
            <td>{user.role}</td>
            <td>{user.savedRecipes.length}</td>
            <td><button disabled={user.role == 'admin'}>Delete</button></td>
          </tr>
        ))}
      </table>
    </div>
  );
};

export default AdminPage;