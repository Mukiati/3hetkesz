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
    /// Interaction logic for BookDetailsWindow.xaml
    /// </summary>
    public partial class BookDetailsWindow : Window
    {
        public BookDetailsWindow(Book book)
        {
            InitializeComponent();
            DataContext = book;
            if (API.LoggedIn) actionsPanel.Visibility = Visibility.Visible;
        }

        private async void editButton_Click(object sender, RoutedEventArgs e)
        {
            BookEditorWindow editor = new BookEditorWindow(DataContext as Book);
            try
            {
                if ((bool)editor.ShowDialog()) await API.SendBook(editor.Book, true);
                DialogResult = true;
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message);
            }
        }

        private async void deleteButton_Click(object sender, RoutedEventArgs e)
        {
            await API.DeleteBook((DataContext as Book).Id);
            DialogResult = true;
        }
    }
}
