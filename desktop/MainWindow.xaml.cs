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
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
            UpdateBooks();
            NewToolbarButton("Log in", LoginButton_Click);
        }
        async void UpdateBooks()
        {
            booksPanel.Children.Clear();
            foreach (Book book in await API.GetBooks())
            {
                booksPanel.Children.Add(new BookControl(book));
            }
        }
        Button NewToolbarButton(string text, RoutedEventHandler clickHandler)
        {
            Button button = new Button { Content = text };
            button.Click += clickHandler;
            toolBar.Children.Add(button);
            return button;
        }
        void LoginButton_Click(object s, RoutedEventArgs e)
        {
            new LoginWindow().ShowDialog();
            if (API.Token == null) LoggedOut();
            else LoggedIn();
        }
        void LogoutButton_Click(object s, RoutedEventArgs e)
        {
            API.LogOut();
            LoggedOut();
        }
        void LoggedOut()
        {
            toolBar.Children.Clear();
            NewToolbarButton("Log in", LoginButton_Click);
        }
        void LoggedIn()
        {
            toolBar.Children.Clear();
            NewToolbarButton("Log out", LogoutButton_Click);
        }
    }
}
