using System;
using System.Windows;

namespace BookCatalog
{
    public partial class ReviewEditorWindow : Window
    {
        public Review Review { get; private set; }

        public ReviewEditorWindow()
        {
            InitializeComponent();
            Review = new Review();
        }

        private void saveButton_Click(object sender, EventArgs e)
        {
            if (!int.TryParse(ratingField.Text, out int rating) || rating < 1 || rating > 5)
            {
                MessageBox.Show("Rating must be a number between 1 and 5.");
                return;
            }

            Review.Rating = rating;
            Review.Content = commentField.Text;

            DialogResult = true;
        }
    }
}
