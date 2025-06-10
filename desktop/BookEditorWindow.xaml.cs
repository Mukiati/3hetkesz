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
    /// <summary>
    /// Interaction logic for BookEditorWindow.xaml
    /// </summary>
    public partial class BookEditorWindow : Window
    {
        public Book Book;
        public BookEditorWindow()
        {
            InitializeComponent();
            saveButton.Content = "Add";
            Title = "Add new book";
            Book = new Book();
        }
        public BookEditorWindow(Book book)
        {
            InitializeComponent();
            DataContext = book;
            Book = book;
            saveButton.Content = "Save";
            Title = "Edit book";
        }
        private void saveButton_Click(object sender, EventArgs e)
        {
            Book.Author = authorField.Text;
            Book.Title = titleField.Text;
            Book.Details = detailsField.Text;
            DialogResult = true;
        }
        private void cancelButton_Click(object sender, EventArgs e) => DialogResult = false;
    }
}
