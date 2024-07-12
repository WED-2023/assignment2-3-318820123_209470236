const DButils = require("./DButils");

async function markAsFavorite(username, recipe_id){
    await DButils.execQuery(`insert into FavoriteRecipes values ('${username}','${recipe_id}')`);
}

async function getFavoriteRecipes(username){
    const recipes_id = await DButils.execQuery(`select recipe_id from FavoriteRecipes where username='${username}'`);
    return recipes_id;
}

async function removeFromFavorites(username, recipe_id) {
    await DButils.execQuery(`DELETE FROM FavoriteRecipes WHERE username='${username}' AND recipe_id=${recipe_id}`);
}

async function markAsWatched(username, recipe_id) {
    await DButils.execQuery(`DELETE FROM LastSeenRecipes WHERE username='${username}' AND recipe_id=${recipe_id}`);
    await DButils.execQuery(`INSERT INTO LastSeenRecipes (username, recipe_id, seen_at) VALUES ('${username}', ${recipe_id}, CURRENT_TIMESTAMP)`);
}

async function getLastWatchedRecipes(username, limit = 5) {
    try {
        const recipes = await DButils.execQuery(
            `SELECT recipe_id FROM LastSeenRecipes WHERE username='${username}' ORDER BY seen_at DESC LIMIT ${limit}`
        );
        return recipes;
    } catch (error) {
        console.error(`Error fetching last watched recipes for user ${username}:`, error);
        throw error;
    }
}


async function isWatched(username, recipe_id) {
    try {
        const result = await DButils.execQuery(`SELECT * FROM LastSeenRecipes WHERE username='${username}' AND recipe_id=${recipe_id}`);
        return result.length > 0;
    } catch (error) {
        console.error(`Error checking if recipe ${recipe_id} is watched by user ${username}:`, error);
        throw error;
    }
}
async function isFavorite(username, recipe_id) {
    try {
        const result = await DButils.execQuery(`SELECT * FROM FavoriteRecipes WHERE username='${username}' AND recipe_id=${recipe_id}`);
        return result.length > 0;
    } catch (error) {
        console.error(`Error checking if recipe ${recipe_id} is favorite by user ${username}:`, error);
        throw error;
    }
}


async function createRecipe(username, title, imageUrl, preparation_time, vegan, vegetarian, gluten_free, ingredients, instructions, servings) {
    try {
        await DButils.execQuery(
            `INSERT INTO recipebyuser (username, title, imageUrl, preparation_time, vegan, vegetarian, gluten_free, ingredients, instructions, servings) 
            VALUES ('${username}', '${title}', '${imageUrl}', ${preparation_time}, ${vegan}, ${vegetarian}, ${gluten_free}, '${ingredients}', '${instructions}', ${servings})`
        );
    } catch (error) {
        console.error(`Error creating recipe:`, error);
        throw error;
    }
}

async function getUserRecipes(username) {
    try {
        const recipes = await DButils.execQuery(
            `SELECT * FROM recipebyuser WHERE username='${username}'`
        );
        return recipes;
    } catch (error) {
        console.error(`Error fetching user recipes for ${username}:`, error);
        throw error;
    }
}

async function getFamilyRecipes(username) {
    try {
        const recipes = await DButils.execQuery(`SELECT * FROM familyrecipebyuser`);
        return recipes;
    } catch (error) {
        console.error(`Error fetching family recipes for user ${username}:`, error);
        throw error;
    }
}
async function deleteRecipe(username, title) {
    try {
        await DButils.execQuery(`DELETE FROM recipebyuser WHERE username='${username}' AND title='${title}'`);
    } catch (error) {
        console.error(`Error deleting recipe for user ${username} with title ${title}:`, error);
        throw error;
    }
}

// Export functions
exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.removeFromFavorites = removeFromFavorites;
exports.markAsWatched = markAsWatched;
exports.getLastWatchedRecipes = getLastWatchedRecipes;
exports.isWatched = isWatched;
exports.isFavorite = isFavorite;
exports.createRecipe = createRecipe;
exports.getUserRecipes = getUserRecipes;
exports.getFamilyRecipes = getFamilyRecipes;
exports.deleteRecipe = deleteRecipe;