import { Review, Book, User } from "./models.js";

export const createReview = async (userId, bookId, content, rating) => {
  if (!content || !rating) return "Content and rating required.";
  // Egy felhasználó csak egyszer véleményezhet egy könyvet
  const existing = await Review.findOne({ where: { userId, bookId } });
  if (existing) return "You have already reviewed this book.";
  return await Review.create({ userId, bookId, content, rating });
};

export const deleteReview = async (userId, reviewId) => {
  const review = await Review.findByPk(reviewId);
  if (!review) return "Review not found.";
  if (review.userId !== userId) return "You can only delete your own review.";
  await review.destroy();
  return true;
};

export const getReviewsForBook = async (bookId) => {
  return await Review.findAll({
    where: { bookId },
    include: [{ model: User, attributes: ["name"] }]
  });
};