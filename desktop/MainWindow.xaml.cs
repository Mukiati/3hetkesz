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
            List<Book> books = await API.GetBooks();
            booksPanel.Children.Clear();
            foreach (Book book in books)
            {
                booksPanel.Children.Add(new BookControl(book, UpdateBooks));
            }
        }
        Button NewToolbarButton(string text, RoutedEventHandler clickHandler)
        {
            Button button = new Button { Content = text };
            button.Click += clickHandler;
            toolBar.Children.Add(button);
            return button;
        }
        async void LoginButton_Click(object s, EventArgs e)
        {
            new LoginWindow().ShowDialog();
            if (!API.LoggedIn)
            {
                LoggedOut();
            }
            else
            {
                LoggedIn();
            }
        }
        void LogoutButton_Click(object s, EventArgs e)
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
            NewToolbarButton("User info", UserInfoButton_Click);
            NewToolbarButton("Add new book", AddButton_Click);
        }
        async void UserInfoButton_Click(object s, EventArgs e)
        {
            UserInfo user = await API.GetUserInfo();
            MessageBox.Show($"Name: {user.Name}\nAccount created at {user.CreatedAt}", "User info");
        }
        async void AddButton_Click(object s, EventArgs e)
        {
            BookEditorWindow editor = new BookEditorWindow();
            try
            {
                if ((bool)editor.ShowDialog())
                {
                    await API.SendBook(editor.Book, false);
                    UpdateBooks();
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message);
            }
        }
    }
}
