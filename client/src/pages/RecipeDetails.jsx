import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

export const RecipeDetails = () => {
  const { id } = useParams(); // Get recipe ID from URL
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/recipes/${id}`);
        setRecipe(response.data);
        console.log(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRecipe();
  }, [id]);

  if (!recipe) return <p>Loading...</p>;

  return (
    <div>
      <div className="p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Recipe Details</h1>
        <button className="bg-blue-500 font-bold rounded-[10px] p-2 px-4 text-white" onClick={()=>print()}>Download PDF</button>
      </div>
      <div className="flex px-4 gap-4">
        <div className="w-[40%]">
          <img
            src={import.meta.env.VITE_BACKEND_URL +recipe.imageUrl}
            alt={recipe.name}
            className="w-full rounded-[10px]"
          />
          {recipe.videoUrl ? <video src={import.meta.env.VITE_BACKEND_URL +recipe.videoUrl} controls></video> :"" }
          
        </div>
        <div className="w-[60%] flex flex-col gap-2">
          <h1 className="font-bold text-2xl">{recipe.name}</h1>
          <p>
            <strong>Description:</strong> {recipe.description}
          </p>
          <p>
            <strong>Cooking Time:</strong> {recipe.cookingTime} minutes
          </p>
          <h3><strong>Ingredients</strong></h3>
          <ul>
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>{index+1} {ingredient}</li>
            ))}
          </ul>
          <h3><strong>Instructions</strong></h3>
          <p>{recipe.instructions}</p>
          <div>
            <Link
              style={{ color: "blue" }}
              to={"/userprofile/" + recipe.userOwner}
            >
              View Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
