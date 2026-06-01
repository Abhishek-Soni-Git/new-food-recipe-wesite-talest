import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Link, useNavigate } from "react-router-dom";
import Logo from '../../assest/recipe.png';
import axios from "axios";

const API = import.meta.env.VITE_BACKEND_URL;

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [cookies, setCookies] = useCookies(["access_token"]);
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [chefData, setChefData] = useState(null);
  const [showChef, setShowChef] = useState(false);

  const logout = () => {
    setShowChef(false);
    setCookies("access_token", "");
    window.localStorage.clear();
    navigate("/auth");
  };

  const fetchChef = async () => {
    const res = await axios.get(`${API}/auth/chefs`);
    console.log(res);
    setChefData(res.data);
  }

  useEffect(() => {
    setShowChef(false);
    const role = window.localStorage.getItem("role");
    if (role == "admin") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
    fetchChef();
  },[]);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="sticky top-0 z-50 bg-white p-2 border-[1px] shadow-sm">
      <div className="mx-2 flex justify-between items-center">
        <Link to={isAdmin ? "/adminhome" : "/home"} className=" font-bold text-xl flex gap-2" onClick={(e)=>setShowChef(false)}>
          <img src={Logo} className="w-[30px]" />
          Recipe App
        </Link>
        <div className="md:hidden">
          <button onClick={toggleMenu} className=" focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        </div>
        <div className={`absolute top-[50px] md:top-0 left-0 w-full bg-white md:w-fit md:relative md:flex md:items-center md:space-x-6 ${isOpen ? "flex" : "hidden"} md:flex-row flex-col`}>
          <ul className="md:flex md:flex-row md:space-x-2">
            <li>
              <Link className="block py-2 px-4" onClick={(e)=>setShowChef(!showChef)}>Chef</Link>
            </li>
            {isAdmin ? "" : (
              <li>
                <Link to="/create-recipe" className="block py-2 px-4" onClick={(e)=>setShowChef(false)}>Create Recipe</Link>
              </li>
            )}
            {isAdmin ? "" : (
              <li>
                <Link to="/saved-recipes" className="block py-2 px-4" onClick={(e)=>setShowChef(false)}>Saved Recipes</Link>
              </li>
            )}
            {isAdmin ? (
              <li><Link to="/adminrecipe" className="block py-2 px-4" onClick={(e)=>setShowChef(false)}>Recipe List</Link></li>
            ) : ""}
            {!cookies.access_token ? (
              <li><Link to="/auth" className="block py-2 px-4" onClick={(e)=>setShowChef(false)}>Login/Register</Link></li>
            ) : (
              <>
                <li><Link to="/userprofile" className="block py-2 px-4" onClick={(e)=>setShowChef(false)}>
                  <img src={window.localStorage.getItem("img")?.startsWith("http") ? window.localStorage?.getItem("img") : API + window.localStorage.getItem("img")} className="rounded-full w-[30px] h-[30px] aspect-square object-cover" />
                </Link></li>
                <li><button onClick={logout} className="block py-2 px-4">Logout</button></li>
              </>
            )}
          </ul>
        </div>
      </div>
      {showChef ? <div className="absolute left-0 top-[65px] z-30 w-full h-[200px] bg-[#d9e7ff] shadow-md px-4 flex gap-4">
        {chefData && chefData.map((data, idx)=> {
          return <Link onClick={(e)=>setShowChef(false)} key={idx} to={"/userprofile/"+data._id} className="w-[200px] h-full flex flex-col items-center justify-center gap-2">
            <img src={data.profilePicture.startsWith("http") ? data.profilePicture : API + data.profilePicture} className="w-[100px] h-[100px] object-cover rounded-full" />
            <span className="font-bold">{data.name}</span>
          </Link>
        })}
      </div> : " "}
    </nav>
  );
}

export default Navbar;