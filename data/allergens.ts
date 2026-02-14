/**
 * قائمة الحساسيات/المسببات – مصدر واحد للواجهة (من alg.json، مع إزالة التكرار).
 * لا يتم إرسالها للباكند كبنية جديدة؛ الحقل allergies يبقى مصفوفة نصوص.
 */
const RAW = [
  "Milk", "Eggs", "Peanuts", "Tree Nuts", "Almonds", "Walnuts", "Cashews",
  "Pistachios", "Hazelnuts", "Pecans", "Brazil Nuts", "Macadamia Nuts",
  "Soy", "Wheat", "Gluten", "Barley", "Rye", "Oats", "Spelt",
  "Fish", "Shellfish", "Shrimp", "Crab", "Lobster", "Mollusks",
  "Clams", "Mussels", "Oysters", "Sesame", "Mustard", "Celery", "Lupin",
  "Corn", "Rice", "Lactose", "Casein", "Whey",
  "Beef", "Chicken", "Pork", "Lamb", "Turkey", "Gelatin",
  "Tomato", "Onion", "Garlic", "Bell Pepper", "Eggplant", "Mushrooms",
  "Strawberry", "Kiwi", "Banana", "Mango", "Pineapple", "Apple", "Peach", "Cherry", "Citrus",
  "Chickpeas", "Lentils", "Peas", "Beans", "Sunflower Seeds", "Pine Nuts", "Coconut",
  "Chocolate", "Cocoa", "Honey", "Yeast", "MSG", "Sulfites",
  "Food Coloring", "Artificial Preservatives", "Aspartame", "Saccharin",
  "High Fructose Corn Syrup", "Anti-oxidants", "Flavor enhancers", "Caffeine",
  "Phenylalanine source", "Phenylalanine", "Tyrosine source", "Tyrosine",
  "Histidine source", "Histidine", "Methionine source", "Methionine",
  "Cysteine source", "Cysteine", "Sweeteners", "Sugar", "Sugar alcohols",
  "Sugar substitutes", "Sugar alternatives", "Color additives", "Acids", "Bases",
  "Enzymes", "Quinine", "Phosphates", "Sorbates", "Sorbitol", "Sucralose",
  "Steviol glycosides", "Xylitol", "Erythritol", "Mannitol", "Isomalt", "Maltose",
  "Maltitol", "Maltodextrin", "Maltotriose",
];

export const ALLERGENS: string[] = Array.from(new Set(RAW));

/** مفتاح ترجمة للحساسية (للاستخدام في i18n: menu.allergens.<key>) */
export function getAllergenKey(allergy: string): string {
  return allergy
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

type TFunction = (key: string) => string;

/** ترجمة الحساسية حسب اللغة؛ إن لم تُوجد ترجمة يُعاد النص الأصلي. */
export function getTranslatedAllergen(allergy: string, t: TFunction): string {
  const key = getAllergenKey(allergy);
  const out = t(`menu.allergens.${key}`);
  if (out === `menu.allergens.${key}`) return allergy;
  return out;
}
