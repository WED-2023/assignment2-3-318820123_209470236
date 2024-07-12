const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";

/**
 * Get recipe information from Spoonacular API
 * @param {*} recipe_id 
 */
async function getRecipeInformation(recipe_id) {
    try {
        const response = await axios.get(`${api_domain}/${recipe_id}/information?includeNutrition=true`, {
            params: {
                includeNutrition: true,
                apiKey: process.env.spoonacular_apiKey || `3d40100fe4bb4612bbbefd33819154fc`
            }
        });
        if (response && response.data) {
            return response.data;
        } else {
            throw new Error('No data in response');
        }
    } catch (error) {
        console.error(`Error fetching recipe information for ID ${recipe_id}:`, error);
        throw error;
    }
}

/**
 * Extract the relevant recipe data for preview
 * @param {*} recipe_id 
 */
async function getRecipePreviewDetails(recipe_id) {
    try {
        let recipe_info = await getRecipeInformation(recipe_id);
        let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info;

        return {
            id: id,
            title: title,
            readyInMinutes: readyInMinutes,
            image: image,
            popularity: aggregateLikes,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree,
        };
    } catch (error) {
        console.error(`Error getting recipe details for ID ${recipe_id}:`, error);
        throw error;
    }
}

/**
 * Extract the relevant recipe data for preview
 * @param {*} recipe_id 
 */
async function getRecipeDetails(recipe_id) {
    try {
        let recipe_info = await getRecipeInformation(recipe_id);
        let {
            id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree,
            summary, analyzedInstructions, instructions, extendedIngredients, servings
        } = recipe_info;

        return {
            id: id,
            title: title,
            readyInMinutes: readyInMinutes,
            image: image,
            aggregateLikes: aggregateLikes,
            vegetarian: vegetarian,
            vegan: vegan,
            glutenFree: glutenFree,
            summary: summary,
            analyzedInstructions: analyzedInstructions,
            instructions: instructions,
            extendedIngredients: extendedIngredients,
            servings: servings
        };
    } catch (error) {
        console.error(`Error getting recipe details for ID ${recipe_id}:`, error);
        throw error;
    }
}

/**
 * Search for recipes based on criteria
 * @param {*} recipeName 
 * @param {*} cuisine 
 * @param {*} diet 
 * @param {*} intolerance 
 * @param {*} number 
 */
async function searchRecipe(recipeName, cuisine, diet, intolerance, number) {
    try {
        const response = await axios.get(`${api_domain}/complexSearch`, {
            params: {
                query: recipeName,
                cuisine: cuisine,
                diet: diet,
                intolerances: intolerance,
                number: number,
                // apiKey: `b06757c88bbf4f2b83293f95845f3e1f`
                apiKey: `3d40100fe4bb4612bbbefd33819154fc`
            }
        });

        if (response && response.data && response.data.results) {
            const recipesDetails = await Promise.all(response.data.results.map(recipe => 
                getRecipePreviewDetails(recipe.id)));
            return recipesDetails;
        } else {
            throw new Error('No results in response');
        }
    } catch (error) {
        console.error('Error searching recipes:', error);
        throw error;
    }
}


/**
 * Get random recipes from Spoonacular API
 * @param {*} number 
 * @param {*} includeTags  
 * @param {*} excludeTags 
 */
async function getRandomRecipes(number, includeTags, excludeTags) {
    try {
        const response = await axios.get(`${api_domain}/random`, {
            params: {
                number: number,
                tags: includeTags.join(','),
                excludeTags: excludeTags.join(','),
                // apiKey: `b06757c88bbf4f2b83293f95845f3e1f`
                apiKey: `3d40100fe4bb4612bbbefd33819154fc`
            }
        });
        
        if (response && response.data && response.data.recipes) {
            const recipesDetails = response.data.recipes.map(recipe => {
                const { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe;
                return {
                    id,
                    title,
                    readyInMinutes,
                    image,
                    popularity: aggregateLikes,
                    vegan,
                    vegetarian,
                    glutenFree
                };
            });
            return recipesDetails;
        } else {
            throw new Error('No recipes found');
        }
    } catch (error) {
        console.error('Error fetching random recipes:', error);
        throw error;
    }
}

/**
 * Get preview information for a list of recipes
 * @param {*} recipe_ids 
 */
async function getRecipesPreview(recipe_ids) {
    try {
        const promises = recipe_ids.map(id => getRecipeInformation(id));
        const recipes = await Promise.all(promises);
        return recipes.map(recipe => {
            const { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe;
            return {
                id,
                title,
                readyInMinutes,
                image,
                popularity: aggregateLikes,
                vegan,
                vegetarian,
                glutenFree
            };
        });
    } catch (error) {
        console.error('Error fetching recipes preview:', error);
        throw error;
    }
}


exports.getRecipeDetails = getRecipeDetails;
exports.searchRecipe = searchRecipe;
exports.getRandomRecipes = getRandomRecipes;
exports.getRecipesPreview = getRecipesPreview;





