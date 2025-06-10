import { Category, Book, sequelize } from "./models.js";
import { Op } from "sequelize";

export const createCategory = async (name) => {
  if (!name || name.trim() === "") {
    return "Category name cannot be empty.";
  }
  const existingCategory = await Category.findOne({ where: { name: name.trim() } });
  if (existingCategory) {
    return `Category "${name.trim()}" already exists.`;
  }
  try {
    const newCategory = await Category.create({ name: name.trim() });
    return newCategory;
  } catch (error) {
    console.error("Error creating category:", error);
    return "Failed to create category.";
  }
};

export const getAllCategories = async () => {
  return await Category.findAll({ order: [['name', 'ASC']] });
};

export const getCategoryById = async (id) => {
    return await Category.findByPk(id);
};

export const editCategory = async (id, newName) => {
  if (!newName || newName.trim() === "") {
    return "New category name cannot be empty.";
  }
  const category = await Category.findByPk(id);
  if (!category) {
    return "Category not found.";
  }
  const existingCategoryWithNewName = await Category.findOne({
    where: { name: newName.trim(), id: { [Op.ne]: id } },
  });
  if (existingCategoryWithNewName) {
    return `Another category with name "${newName.trim()}" already exists.`;
  }
  try {
    category.name = newName.trim();
    await category.save();
    return category;
  } catch (error) {
    console.error("Error editing category:", error);
    return "Failed to edit category.";
  }
};

export const deleteCategory = async (id) => {
  const category = await Category.findByPk(id);
  if (!category) {
    return "Category not found.";
  }
  try {
    await category.destroy(); 
    return true;
  } catch (error)    {
    console.error("Error deleting category:", error);
    return "Failed to delete category.";
  }
};

export const getCategoryStats = async () => {
  const categories = await Category.findAll({
    include: [{
        model: Book,
        as: 'books',
        attributes: [],      // Nem kérünk le oszlopokat a Book táblából
        through: { attributes: [] } // Nem kérünk le oszlopokat a kapcsolótáblából sem
    }],
    attributes: [
        'id',
        'name',
        // Az aggregált oszlop: megszámoljuk a 'books' kapcsolaton keresztül elérhető könyvek ID-jait
        [sequelize.fn('COUNT', sequelize.col('books.id')), 'bookCount']
    ],
    // Csak a kiválasztott, nem aggregált 'Category' oszlopok alapján csoportosítunk
    group: ['Category.id', 'Category.name'], // MÓDOSÍTVA ITT!
    order: [['name', 'ASC']]
  });

  // A map továbbra is rendben van, feltéve, hogy a 'bookCount' helyesen jön vissza
  return categories.map(c => ({
    id: c.id,
    name: c.name,
    // A 'get' metódus használata jó, ha az alias ('bookCount') nem közvetlenül property-ként jelenik meg
    bookCount: parseInt(c.get('bookCount'), 10) || 0
  }));
};


export const addCategoryToBook = async (bookId, categoryId) => {
    const book = await Book.findByPk(bookId);
    if (!book) return "Book not found.";
    const category = await Category.findByPk(categoryId);
    if (!category) return "Category not found.";

    try {
        await book.addCategory(category);
        return await Book.findByPk(bookId, { include: [{ model: Category, as: 'categories', through: { attributes: [] } }] });
    } catch (error) {
        console.error("Error adding category to book:", error);
        return "Failed to add category to book. It might already be associated.";
    }
};