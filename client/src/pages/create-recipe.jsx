import React , { useState } from "react";
import axios from "axios";
import { useGetUserID } from "../hooks/useGetUserID";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { FcCancel } from "react-icons/fc";
import { FaPlus } from "react-icons/fa";

const API = import.meta.env.VITE_BACKEND_URL;

export const CreateRecipe = () => {
  const userID = useGetUserID();
  const [cookies, _] = useCookies(["access_token"]);
  const [imgFile, setImgFile] = useState(null);
  const [vidFile, setVidFile] = useState(null);
  const [recipe, setRecipe] = useState({
    name: "",
    description: "",
    ingredients: [],
    instructions: "",
    imageUrl: "",
    cookingTime: 0,
    category: "Food",
    userOwner: userID,
  });
  const [category, setCategory] = useState("");
  const categories = ["Breakfast", "Lunch", "Dinner", "Desserts"];
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setRecipe({ ...recipe, [name]: value });
  };

  const handleIngredientChange = (event, index) => {
    const { value } = event.target;
    const ingredients = [...recipe.ingredients];
    ingredients[index] = value;
    setRecipe({ ...recipe, ingredients });
  };

  const handleAddIngredient = () => {
    const ingredients = [...recipe.ingredients, ""];
    setRecipe({ ...recipe, ingredients });
  };

  const handleRemoveIngredient = (index) => {
    const ingredients = recipe.ingredients.filter((_, i) => i !== index);
    setRecipe({ ...recipe, ingredients });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    if(!imgFile){
      alert("Please select image");
      return;
    }
    if(!vidFile){
      formData.append('video', null);
    } else {
      formData.append('video', vidFile);
    }
    formData.append('image', imgFile);
    setRecipe({ ...recipe, category });
    for (const key in recipe) {
      if (recipe.hasOwnProperty(key)) {
        formData.append(key, recipe[key]);
      }
    }
    try {
      await axios.post(`${API}/recipes`, formData, {
        headers: { authorization: cookies.access_token },
      });
      alert("Recipe Created");
      navigate("/home");
    } catch (error) {
      if (error.response) {
        console.error(`Error ${error.response.status}:`, error.response.data.message);
      } else {
        console.error("Error:", error.message);
      }
    }
  };

  return (
    <div>
      <div className="p-4">
        <h2 className="font-bold text-2xl">Create Recipe</h2>
      </div>
      <div className="px-4">
        <form onSubmit={handleSubmit} className="flex flex-col p-4 bg-white rounded-[10px]">
          <div className="flex gap-4 justify-between">
            <div className="flex flex-col gap-2 w-[50%]">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" value={recipe.name}
                className="p-1 px-2 bg-gray-100 rounded-[5px] border-[1px]"
                placeholder="Enter Name" onChange={handleChange} />
              <label htmlFor="description">Description</label>
              <textarea id="description" name="description" value={recipe.description}
                className="p-1 px-2 bg-gray-100 rounded-[5px] border-[1px]"
                onChange={handleChange} placeholder="Enter Description"
                style={{ height: "100px" }}></textarea>
              <label htmlFor="ingredients">Ingredients</label>
              {recipe.ingredients.map((ingredient, index) => (
                <div key={index} style={{ display: "flex", alignItems: "center" }}>
                  <input key={index} type="text" name="ingredients" value={ingredient}
                    className="p-1 bg-gray-100 mr-4 rounded-[5px] px-2 border-[1px]"
                    onChange={(event) => handleIngredientChange(event, index)}
                    placeholder={`Ingredient ${index + 1}`} />
                  <button type="button" className="p-2 bg-red-200 rounded-[10px]"
                    onClick={() => handleRemoveIngredient(index)}>
                    <FcCancel />
                  </button>
                </div>
              ))}
              <button type="button" onClick={handleAddIngredient}
                className="flex justify-center items-center gap-2 bg-black rounded-[5px] text-white p-1">
                <FaPlus /> Add Ingredient
              </button>
            </div>
            <div className="flex gap-2 flex-col w-[50%]">
              <label htmlFor="instructions">Instructions</label>
              <textarea id="instructions" name="instructions" value={recipe.instructions}
                onChange={handleChange} placeholder="Enter Instructions"
                className="h-[100px] p-1 px-2 bg-gray-100 rounded-[5px] border-[1px]"></textarea>
              <label htmlFor="imageUrl">Image</label>
              <input type="file" id="imageUrl" name="image"
                onChange={(e) => setImgFile(e.target.files[0])} accept="image/*"
                className="p-1 px-2 bg-gray-100 rounded-[5px] border-[1px]" />
              <label htmlFor="videoUrl">Video</label>
              <input type="file" id="videoUrl" name="video" accept="video/*"
                onChange={(e) => setVidFile(e.target.files[0])}
                className="p-1 px-2 bg-gray-100 rounded-[5px] border-[1px]" />
              <label htmlFor="cookingTime">Cooking Time (minutes)</label>
              <input type="number" id="cookingTime" name="cookingTime" value={recipe.cookingTime}
                className="p-1 px-2 bg-gray-100 rounded-[5px] border-[1px]" onChange={handleChange} />
              <label htmlFor="recipecategory">Recipe Category</label>
              <select id="recipecategory" value={category} name="category"
                onChange={(e) => { handleChange(e); setCategory(e.target.value); }}
                className="p-1 px-2 bg-gray-100 rounded-[5px] border-[1px]" required>
                <option value="Food">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} selected={category == cat ? true : false}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-center mt-4">
            <button type="submit" className="bg-blue-500 font-bold rounded-[10px] p-2 px-4 text-white">
              Create Recipe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};