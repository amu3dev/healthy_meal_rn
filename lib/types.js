/**
 * @typedef {Object} Preferences
 * @property {boolean} vegetarian
 * @property {boolean} vegan
 * @property {boolean} glutenFree
 * @property {boolean} dairyFree
 * @property {boolean} lowCarb
 * @property {boolean} highProtein
 * @property {boolean} [highProteinOnly]
 */

/**
 * @typedef {Object} MealTags
 * @property {boolean} vegetarian
 * @property {boolean} vegan
 * @property {boolean} glutenFree
 * @property {boolean} dairyFree
 * @property {boolean} lowCarb
 * @property {boolean} highProtein
 */

/**
 * @typedef {Object} Meal
 * @property {number} id
 * @property {string} name
 * @property {number} calories
 * @property {string} protein
 * @property {string} carbs
 * @property {string} fats
 * @property {string} fiber
 * @property {string} prepTime
 * @property {string} difficulty
 * @property {string} cuisine
 * @property {number} servings
 * @property {string} image
 * @property {string[]} ingredients
 * @property {string[]} instructions
 * @property {MealTags} tags
 */

export const TYPE_DOCS = {};
