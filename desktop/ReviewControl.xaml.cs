using System;
using System.Windows;
using System.Windows.Controls;

namespace BookCatalog
{
    public partial class ReviewControl : UserControl
    {
        private readonly Review _review;
        private readonly Action _refreshReviews;

        public ReviewControl(Review review, Action refreshReviews)
        {
            InitializeComponent();
            _review = review;
            _refreshReviews = refreshReviews;
            DataContext = _review;

            if (API.LoggedIn && API.CurrentUser.Id == _review.User.Id)
            {
                deleteReviewButton.Visibility = Visibility.Visible;
            }
        }

        private async void deleteReviewButton_Click(object sender, EventArgs e)
        {
            if (deleteReviewButton.Visibility == Visibility.Visible)
            {
                MessageBox.Show("törölve");
                try
                {
                    await API.DeleteReview(_review.Id);
                    _refreshReviews?.Invoke();
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Failed to delete review");
                }
            }
        }
    }
}