export const DELIVERY_CATEGORIES = {
  BEVERAGES: {
    label: "Beverages",
    subCategories: [
      "Sofdrinks",
      "Mocktails",
      "Milkbased",
      "Tea Based",
      "Fresh Juice",
      "Coffee Based",
      "Manual Brew",
      "Choco Based",
      "Matcha Series",
      "Beers",
    ],
  },
  FOOD: {
    label: "Food",
    subCategories: [
      "Salad",
      "Light Bite",
      "Soup",
      "Maincourse Rice",
      "Maincourse Chicken",
      "Maincourse Beef",
      "Maincourse Fish",
      "Pasta",
      "Pizza",
      "Dessert",
      "Package Promo / Bundle",
    ],
  },
} as const;

export type DeliveryCategoryKey = keyof typeof DELIVERY_CATEGORIES;
