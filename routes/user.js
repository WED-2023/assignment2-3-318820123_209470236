var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  console.log(req.session.username);
  if (req.session && req.session.username) {
    DButils.execQuery("SELECT username FROM users").then((users) => {
      console.log(req.session.username)
      if (users.find((x) => x.username === req.session.username)) {
        req.username = req.session.username;
        next();
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
});


/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/favorites', async (req,res,next) => {
  try{
    const username = req.session.username;
    const recipe_id = req.body.recipeId;
    console.log(recipe_id);
    await user_utils.markAsFavorite(username,recipe_id);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
  }
})

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/favorites', async (req,res,next) => {
  try{
    const username = req.session.username;
    let favorite_recipes = {};
    const recipes_id = await user_utils.getFavoriteRecipes(username);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});


/**
 * This path deletes a favorite recipe by user ID and recipe ID
 */
router.delete('/favorites', async (req, res, next) => {
  try {
    const username = req.session.username;
    const recipe_id = req.body.recipeId;
    await user_utils.removeFromFavorites(username, recipe_id);
    res.status(200).send("The Recipe successfully removed from favorites");
  } catch (error) {
    next(error);
  }
});


/**
 * This path saves a recipe as "last seen" for the logged-in user
 */
router.post('/watched', async (req, res, next) => {
  try {
    const username = req.session.username;
    const recipe_id = req.body.recipeId;
    await user_utils.markAsWatched(username, recipe_id);
    res.status(200).send("The Recipe successfully marked as watched");
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns the last watched recipes that were saved by the logged-in user
 */
router.get('/lastWatchedRecipes', async (req, res, next) => {
  try {
    const username = req.session.username;
    const recipes_id = await user_utils.getLastWatchedRecipes(username);
    let recipes_id_array = recipes_id.map((element) => element.recipe_id); // extracting the recipe ids into an array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});

/**
 * This path checks if the recipe has been watched by the logged-in user
 */
router.post('/isWatched', async (req, res, next) => {
  try {
    const username = req.session.username;
    const recipe_id = req.body.recipeId;
    const watched = await user_utils.isWatched(username, recipe_id);
    res.status(200).send({ watched });
  } catch (error) {
    next(error);
  }
});

/**
 * This path checks if the recipe is favorite for the logged-in user
 */
router.post('/isFavorite', async (req, res, next) => {
  try {
    const username = req.session.username;
    const recipe_id = req.body.recipeId;
    const favorite = await user_utils.isFavorite(username, recipe_id);
    res.status(200).send({ favorite });
  } catch (error) {
    next(error);
  }
});



/**
 * This path creates a new recipe
 */
router.post('/createARecipe', async (req, res, next) => {
  try {
    const username = req.session.username;
    const { title, imageUrl, preparation_time, vegan, vegetarian, gluten_free, ingredients, instructions, servings } = req.body;
    await user_utils.createRecipe(username, title, imageUrl, preparation_time, vegan, vegetarian, gluten_free, ingredients, instructions, servings);
    res.status(201).send("The Recipe successfully created");
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns the recipes created by the logged-in user
 */
router.get('/userRecipes', async (req, res, next) => {
  try {
    const username = req.session.username;
    const userRecipes = await user_utils.getUserRecipes(username);
    res.status(200).send(userRecipes);
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns the family recipes that were saved by the logged-in user
 */
router.get('/myFamilyRecipes', async (req, res, next) => {
  try {
    const username = req.session.username;
    const familyRecipes = await user_utils.getFamilyRecipes(username);
    res.status(200).send(familyRecipes);
  } catch (error) {
    next(error);
  }
});

/**
 * This path deletes a recipe created by the user based on username and recipe title
 */
router.delete('/deleteRecipe', async (req, res, next) => {
  try {
    const { title } = req.query;
    const username = req.session.username;

    if (!username || !title) {
      return res.status(400).send({ success: false, message: "Username and title are required" });
    }

    await user_utils.deleteRecipe(username, title);
    res.status(200).send({ success: true, message: "Recipe deleted successfully" });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    next(error);
  }
});


module.exports = router;
