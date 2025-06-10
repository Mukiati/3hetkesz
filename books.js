import { Book, Category } from "./models.js"; 
import { Op } from "sequelize";

export const newBook = async (author, title, details, categoryIds = []) => {
  if (!(author && title && details)) return "You must fill out all fields!";
  try {
    const book = await Book.create({
      author: author,
      title: title,
      details: details,
    });
    if (categoryIds && categoryIds.length > 0) {
      const validCategoryIds = categoryIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
      if (validCategoryIds.length > 0) {
        await book.setCategories(validCategoryIds);
      }
    }
    
    return await Book.findByPk(book.id, { include: [{ model: Category, as: 'categories', through: { attributes: [] } }] });
  } catch (error) {
    console.error("Error creating new book:", error);
    return "Error creating new book. Please check category IDs if provided.";
  }
};

export const editBook = async (id, author, title, details, categoryIds = []) => {
  if (!(author && title && details)) return "You must fill out all fields!";
  const book = await Book.findByPk(id);
  if (book) {
    try {
      await book.update({ author: author, title: title, details: details });
      
      
      const validCategoryIds = (Array.isArray(categoryIds) ? categoryIds : (categoryIds ? [categoryIds] : []))
                               .map(cid => parseInt(cid, 10)).filter(cid => !isNaN(cid));
      
      await book.setCategories(validCategoryIds);
      
      return await Book.findByPk(book.id, { include: [{ model: Category, as: 'categories', through: { attributes: [] } }] });
    } catch (error) {
      console.error("Error editing book:", error);
      return "Error editing book. Please check category IDs if provided.";
    }
  } else return "No book with that id!";
};

export const searchBooks = (search) => {
  if (typeof search == "undefined") search = "";
  return Book.findAll({
    order: [["updatedAt", "DESC"]],
    where: { title: { [Op.like]: "%" + search + "%" } },
    include: [{ model: Category, as: 'categories', through: { attributes: [] } }]
  });
};


export const getBooksByCategory = async (categoryId) => {
    const parsedCategoryId = parseInt(categoryId, 10);
    if (isNaN(parsedCategoryId)) {
        return []; 
    }
    const category = await Category.findByPk(parsedCategoryId, {
        include: [{
            model: Book,
            as: 'books',
            include: [{ model: Category, as: 'categories', through: { attributes: [] } }],
            through: { attributes: [] }
        }],
        order: [
            [{ model: Book, as: 'books' }, 'title', 'ASC']
        ]
    });
    if (!category) return [];
    return category.books;
};