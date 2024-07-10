const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";



/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


async function getRecipeInformation(recipe_id) {
        const response = await axios.get(`${api_domain}/${recipe_id}/information`, {
            params: {
                includeNutrition: true,
                // apiKey:`b06757c88bbf4f2b83293f95845f3e1f`
                apiKey: process.env.spoonacular_apiKey
            }
        });
    //     console.log("Hashed password:", response);
}



async function getRecipeDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        
    }
}

async function searchRecipe(recipeName, cuisine, diet, intolerance, number, username) {
    const response = await axios.get(`${api_domain}/complexSearch`, {
        params: {
            query: recipeName,
            cuisine: cuisine,
            diet: diet,
            intolerances: intolerance,
            number: number,
            apiKey: process.env.spooncular_apiKey
            // apiKey:`b06757c88bbf4f2b83293f95845f3e1f`
        }
    });

    return getRecipesPreview(response.data.results.map((element) => element.id), username);
}




// async function getRandomRecipes(number) {
//     const response = await axios.get(`${api_domain}/Random`, {
//         params: {
//             number: number,
//             // apiKey: process.env.spooncular_apiKey
//             apiKey:b06757c88bbf4f2b83293f95845f3e1f
//             }
//     });

//     return response.data.recipes.map(recipe => ({
//         id: recipe.id,
//         title: recipe.title,
//         readyInMinutes: recipe.readyInMinutes,
//         image: recipe.image,
//         popularity: recipe.aggregateLikes,
//         vegan: recipe.vegan,
//         vegetarian: recipe.vegetarian,
//         glutenFree: recipe.glutenFree
//     }));
// }

// module.exports = {
//     getRecipeDetails,
//     searchRecipe,
//     getRandomRecipes // Export the new function
// };


exports.getRecipeDetails = getRecipeDetails;



