import React, { useEffect, useState } from "react";
import { useGetUserID } from "../hooks/useGetUserID";
import axios from "axios";
import { Link } from "react-router-dom";

const API = import.meta.env.VITE_BACKEND_URL;

export const SavedRecipes = () => {
  const [savedRecipes, setSavedRecipes] = useState([]);
  const userID = useGetUserID();

  useEffect(() => {
    const fetchSavedRecipes = async () => {
      try {
        const response = await axios.get(
          `${API}/recipes/savedRecipes/${userID}`
        );
        console.log(response.data.savedRecipes);
        setSavedRecipes(response.data.savedRecipes);
      } catch (err) {
        console.log(err);
      }
    };
    fetchSavedRecipes();
  }, []);

  return (
    <div className="h-[90%]">
      <div className="flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold">Saved Recipes</h1>
      </div>
      <div className="p-4">
        <ul className="flex flex-wrap gap-4">
          {savedRecipes.map((recipe) => (
            <li className="w-[300px] flex flex-col justify-between bg-white rounded-[10px] overflow-hidden" key={recipe._id}>
              <div className="flex flex-col">
                <img src={API + recipe.imageUrl} alt={recipe.name} className="aspect-square object-cover" />
                <h2 className="p-2 font-bold text-lg">{recipe.name}</h2>
                {recipe.description ? <p className="px-2 line-clamp-3 text-sm overflow-hidden text-ellipsis leading-tight">{recipe.description}</p> : ''}
                <p className="p-2 text-sm">Cooking Time: {recipe.cookingTime} minutes</p>
              </div>
              <Link className="p-2 text-sm text-blue-600" to={"/recipe/" + recipe._id}>More details..</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};