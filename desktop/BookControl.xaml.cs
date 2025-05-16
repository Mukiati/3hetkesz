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
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace BookCatalog
{
    /// <summary>
    /// Interaction logic for BookControl.xaml
    /// </summary>
    public partial class BookControl : UserControl
    {
        Action UpdateBooks;
        public BookControl(Book book, Action updateBooks)
        {
            InitializeComponent();
            DataContext = book;
            UpdateBooks = updateBooks;
        }

        private void Border_MouseUp(object sender, MouseButtonEventArgs e)
        {
            if ((bool)new BookDetailsWindow(DataContext as Book).ShowDialog()) UpdateBooks();
        }
    }
}
