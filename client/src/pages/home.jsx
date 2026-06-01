import React, { useEffect, useState } from "react";
import { useGetUserID } from "../hooks/useGetUserID";
import axios from "axios";
import { BiDislike, BiLike, BiSolidDislike, BiSolidLike } from "react-icons/bi";
import { FaRegSave, FaSave } from "react-icons/fa";
import { Link } from "react-router-dom";
import Slider from "../components/Slider";

const API = import.meta.env.VITE_BACKEND_URL;

export const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [recipeCategorywise, setRecipeCategorywise] = useState(null);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [query, setQuery] = useState("");
  const [isSearch, setIsSearch] = useState(false);
  const userID = useGetUserID();

  const fetchRecipes = async () => {
    try {
      const response = await axios.get(`${API}/recipes`);
      const response2 = await axios.get(`${API}/recipes/categorieswise`);
      setRecipes(response.data);
      setRecipeCategorywise(response2.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const fetchSavedRecipes = async () => {
      try {
        const response = await axios.get(
          `${API}/recipes/savedRecipes/ids/${userID}`, { data: 0 }
        );
        setSavedRecipes(response.data.savedRecipes);
      } catch (err) {
        console.log(err);
      }
    };
    fetchRecipes();
    fetchSavedRecipes();
  }, []);

  const saveRecipe = async (recipeID) => {
    try {
      const response = await axios.put(`${API}/recipes/`, { recipeID, userID });
      setSavedRecipes(response.data.savedRecipes);
    } catch (err) { console.log(err); }
  };

  const toggleLike = async (recipeID) => {
    try {
      await axios.put(`${API}/recipes/toggleLike`, { recipeID, userID });
      fetchRecipes();
    } catch (err) { console.log(err); }
  };

  const toggleDisLike = async (recipeID) => {
    try {
      await axios.put(`${API}/recipes/toggleDisLike`, { recipeID, userID });
      fetchRecipes();
    } catch (err) { console.log(err); }
  };

  const isRecipeSaved = (id) => savedRecipes.includes(id);

  const searchRecipes = (e) => {
    e.preventDefault();
    const filtered = recipes.filter(
      (recipe) =>
        recipe.name.toLowerCase().includes(query.toLowerCase()) ||
        recipe.category?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredRecipes(filtered);
    setIsSearch(true);
  };

  const RecipeCard = ({ rcp }) => (
    <div className="w-[250px] flex-none bg-white rounded-lg shadow-lg overflow-hidden" key={rcp._id}>
      <img src={API + rcp.imageUrl} alt={rcp.name} className="w-full h-[150px] object-cover" />
      <div className="p-4">
        <h3 className="font-semibold text-lg">{rcp.name}</h3>
        <p className="text-gray-500 mt-2">Cooking Time: {rcp.cookingTime} minutes</p>
        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button onClick={() => toggleLike(rcp._id)} className="flex items-center gap-1 text-gray-700">
              {rcp.likes.length}
              {rcp.likes.includes(userID) ? <BiSolidLike /> : <BiLike />}
            </button>
            <button onClick={() => toggleDisLike(rcp._id)} className="flex items-center gap-1 text-gray-700">
              {rcp.dislikes.length}
              {rcp.dislikes.includes(userID) ? <BiSolidDislike /> : <BiDislike />}
            </button>
          </div>
          <button onClick={() => saveRecipe(rcp._id)} className={`${isRecipeSaved(rcp._id) ? "text-green-500" : "text-gray-500"}`}>
            {isRecipeSaved(rcp._id) ? <FaSave /> : <FaRegSave />}
          </button>
        </div>
        <Link to={`/recipe/${rcp._id}`} className="block mt-4 text-blue-600 font-bold text-center">
          More Details
        </Link>
      </div>
    </div>
  );

  return (
    <div className="h-[90%] px-[20%]">
      <div className="flex justify-between items-center p-4">
        {isSearch
          ? <button className="bg-black p-2 px-4 text-white rounded-full" onClick={() => setIsSearch(false)}>Back Home</button>
          : <h1 className="text-2xl font-bold">Recipes</h1>}
        <div className="flex border-[1px] rounded-[10px] overflow-hidden">
          <input type="search" className="p-1 bg-gray-50 outline-none" value={query} onChange={(e) => setQuery(e.target.value)} />
          <button className="bg-white p-1 px-2" onClick={searchRecipes}>Search</button>
        </div>
      </div>

      {isSearch
        ? <div className="flex flex-col gap-8">
            {filteredRecipes && filteredRecipes.map((rcp) => <RecipeCard key={rcp._id} rcp={rcp} />)}
          </div>
        : <>
            <Slider />
            <div className="p-4">
              <div className="flex flex-col gap-8">
                {recipeCategorywise && recipeCategorywise.categories.map((data, idx) => (
                  <div key={idx}>
                    <h2 className="font-bold text-xl mb-4">{data.name}</h2>
                    <div className="flex gap-6 overflow-x-auto">
                      {data.data.map((rcp) => <RecipeCard key={rcp._id} rcp={rcp} />)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>}
    </div>
  );
};