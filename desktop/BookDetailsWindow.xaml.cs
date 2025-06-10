using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;

namespace BookCatalog
{
    public partial class BookDetailsWindow : Window
    {
        private Book _currentBook;

        public BookDetailsWindow(Book book)
        {
            InitializeComponent();
            _currentBook = book;
            DataContext = _currentBook;
        }

        private async void Window_Loaded(object sender, EventArgs e)
        {
           
            await LoadReviewsAndSetButtonVisibility();
        }

        private async Task LoadReviewsAndSetButtonVisibility()
        {
          
            reviewsPanel.Items.Clear();
            try
            {
                List<Review> reviews = await API.GetReviewsForBook(_currentBook.Id);
                foreach (var review in reviews)
                {
                  
                    reviewsPanel.Items.Add(new ReviewControl(review, async () => await LoadReviewsAndSetButtonVisibility()));
                }

               
                if (API.LoggedIn)
                {
                    actionsPanel.Visibility = Visibility.Visible;

                    
                    bool userHasReviewed = reviews.Any(r => r.User.Id == API.CurrentUser.Id);
                    if (userHasReviewed)
                    {
                        addReviewButton.Visibility = Visibility.Collapsed;
                    }
                    else
                    {
                        addReviewButton.Visibility = Visibility.Visible;
                    }
                }
                else
                {
                    actionsPanel.Visibility = Visibility.Collapsed;
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Could not load reviews: {ex.Message}");
            }
        }


        private async void editButton_Click(object sender, EventArgs e)
        {
            BookEditorWindow editor = new BookEditorWindow(_currentBook);
            try
            {
                if (editor.ShowDialog() == true)
                {
                    await API.SendBook(editor.Book, true);
                    DialogResult = true;
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message);
            }
        }

        private async void deleteButton_Click(object sender, EventArgs e)
        {
            if (deleteButton.Content == "delete")
            {
                MessageBox.Show("Are you sure you want to delete this book?");
                try
                {
                    await API.DeleteBook(_currentBook.Id);
                    DialogResult = true;
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Failed to delete book: {ex.Message}", "Error");
                }
            }
        }

        private async void addReviewButton_Click(object sender, EventArgs e)
        {
            var editor = new ReviewEditorWindow();
            if (editor.ShowDialog() == true)
            {
                try { 
                
                    var newReview = editor.Review;
                    newReview.BookId = _currentBook.Id;
                    await API.SendReview(newReview);
                    await LoadReviewsAndSetButtonVisibility();
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Error submitting review: {ex.Message}", "Error");
                }
            }
        }
    }
}