import React, { useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';

const API = import.meta.env.VITE_BACKEND_URL;

export const Auth = () => {
  const [islogin, setislogin] = useState(true);
  return (
    <div className="bg-[#d1d1c9] h-[90%] flex flex-col gap-4 items-center justify-center">
      {islogin ? <UserLogin setislogin={setislogin} /> : <UserRegister setislogin={setislogin} />}
    </div>
  );
};

const UserRegister = ({ setislogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState(null);
  const [_, setCookies] = useCookies(["token", "role"]);

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('username', username);
      formData.append('password', password);
      formData.append('role', "User");
      await axios.post(`${API}/auth/register`, formData);
      setUsername("");
      setPassword("");
      setImage(null);
      alert("Registration Completed! Now login.");
      setislogin(true);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-100px flex justify-center items-center">
      <div className="bg-white p-4 h-30 w- rounded-[10px] object-cover">
        <form onSubmit={handleSubmit} className="min-w-[450px] flex flex-col gap-2">
          <h2 className="text-center font-bold text-xl mb-4">User Register</h2>
          <input type="file" onChange={handleFileChange} accept="image/*" />
          <div className="flex flex-col">
            <label htmlFor="username">Username:</label>
            <input type="text" id="username" value={username} placeholder="Enter your username"
              className="p-1 bg-gray-100 outline-none border-[1px] rounded-[5px]"
              onChange={(event) => setUsername(event.target.value)} />
          </div>
          <div className="flex flex-col">
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" value={password} placeholder="Enter your password"
              className="p-1 bg-gray-100 outline-none border-[1px] rounded-[5px]"
              onChange={(event) => setPassword(event.target.value)} />
          </div>
          <button type="submit" className="mt-2 p-1 rounded-[5px] bg-black text-white">Register</button>
          <a onClick={() => setislogin(true)} className="text-center cursor-pointer">
            Already have an account?
          </a>
        </form>
      </div>
    </div>
  );
};

const UserLogin = ({ setislogin }) => {
  const [_, setCookies] = useCookies(["access_token"]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLoginSuccess = async (credentialResponse) => {
    const { credential } = credentialResponse;
    const userData = JSON.parse(atob(credential.split('.')[1]));
    if (userData) {
      const response = await axios.post(`${API}/auth/google`, {
        email: userData.email,
        name: userData.name,
        profilePicture: userData.picture,
        token: credential
      });
      setCookies("access_token", credential);
      window.localStorage.setItem("userID", response.data.user._id);
      window.localStorage.setItem("userName", response.data.user.username);
      window.localStorage.setItem("role", response.data.user.role);
      window.localStorage.setItem("img", response.data.user.profilePicture);
      navigate("/home");
    }
  };

  const handleLoginError = (error) => {
    console.error('Login Failed:', error);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const result = await axios.post(`${API}/auth/login`, {
        username,
        password,
      });
      setCookies("access_token", result.data.token);
      window.localStorage.setItem("userID", result.data.userID);
      window.localStorage.setItem("userName", result.data.username);
      window.localStorage.setItem("role", result.data.role);
      window.localStorage.setItem("img", result.data.profilePicture);
      navigate("/home");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-white p-4 rounded-[10px]">
      <form onSubmit={handleSubmit} className="min-w-[450px] flex flex-col gap-2">
        <h2 className="text-center font-bold text-xl mb-4">Login</h2>
        <div className="flex flex-col">
          <label htmlFor="username">Username</label>
          <input type="text" id="username" value={username} placeholder="Enter your email"
            className="p-1 bg-gray-100 outline-none border-[1px] rounded-[5px]"
            onChange={(event) => setUsername(event.target.value)} />
        </div>
        <div className="flex flex-col">
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" value={password} placeholder="Enter your password"
            className="p-1 bg-gray-100 outline-none border-[1px] rounded-[5px]"
            onChange={(event) => setPassword(event.target.value)} />
        </div>
        <button type="submit" className="mt-2 p-1 rounded-[5px] bg-black text-white">Login</button>
        <a onClick={() => setislogin(false)} className="text-center cursor-pointer">
          Don't have an account?
        </a>
        <div>
          <h2>Sign in with Google</h2>
          <GoogleLogin onSuccess={handleLoginSuccess} onError={handleLoginError} />
        </div>
      </form>
    </div>
  );
};

const AdminRegister = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [_, setCookies] = useCookies(["token", "role"]);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const result = await axios.post(`${API}/auth/login`, {
        username,
        password,
      });
      setCookies("access_token", result.data.token);
      window.localStorage.setItem("userID", result.data.userID);
      window.localStorage.setItem("role", result.data.role);
      if (result.data.role == "admin") {
        navigate("/adminhome");
      } else {
        navigate("/home");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-white p-4 rounded-[10px]">
      <form onSubmit={handleSubmit} className="min-w-[450px] flex flex-col gap-2">
        <h2 className="text-center font-bold text-xl mb-4">Admin Login</h2>
        <div className="flex flex-col">
          <label htmlFor="username">Username:</label>
          <input type="text" id="username" value={username} placeholder="Enter your email"
            className="p-1 bg-gray-100 outline-none border-[1px] rounded-[5px]"
            onChange={(event) => setUsername(event.target.value)} />
        </div>
        <div className="flex flex-col">
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" value={password} placeholder="Enter your password"
            className="p-1 bg-gray-100 outline-none border-[1px] rounded-[5px]"
            onChange={(event) => setPassword(event.target.value)} />
        </div>
        <button type="submit" className="mt-2 p-1 rounded-[5px] bg-black text-white">Login</button>
      </form>
    </div>
  );
};