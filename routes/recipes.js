var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");

router.get("/", (req, res) => res.send("im here"));

/**
 * This path is for searching a recipe
 */
router.get("/search", async (req, res, next) => {
  try {
    const recipeName = req.query.recipeName;
    const cuisine = req.query.cuisine;
    const diet = req.query.diet;
    const intolerance = req.query.intolerance;
    const number = req.query.number || 5;
    const results = await recipes_utils.searchRecipe(recipeName, cuisine, diet, intolerance, number);
    res.send(results);
  } catch (error) {
    next(error);
  }
});
/**
 * This path returns a full details of a recipe by its id
 */
router.get("/:recipeId", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});


/**
 * This path is for getting random recipes
 */
router.get("/recipe/random", async (req, res, next) => {
  try {
    const number = req.query.number || 1;
    const includeTags = req.query['include-tags'] ? req.query['include-tags'].split(',') : [];
    const excludeTags = req.query['exclude-tags'] ? req.query['exclude-tags'].split(',') : [];
    const randomRecipes = await recipes_utils.getRandomRecipes(number, includeTags, excludeTags);
    res.send(randomRecipes);
  } catch (error) {
    next(error);
  }
});



module.exports = router;
