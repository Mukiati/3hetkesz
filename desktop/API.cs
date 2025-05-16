using System;
using System.Collections.Generic;
using System.Linq;
using System.Resources;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Net.Http;
using System.Windows;

namespace BookCatalog
{
    public static class API
    {
        static readonly string URL = "http://localhost:9000/api/";
        static readonly HttpClient http = new HttpClient();
        static string Token { get; set; } = null;
        public static bool LoggedIn => Token != null;
        static async Task<bool> LoginOrRegister(string action, string name, string password)
        {
            string body = null;
            try
            {
                string json = JsonConvert.SerializeObject(new LoginBody(name, password));
                HttpContent reqBody = new StringContent(json, Encoding.UTF8, "application/json");
                HttpResponseMessage response = await http.PostAsync(URL + action, reqBody);
                body = await response.Content.ReadAsStringAsync();
                response.EnsureSuccessStatusCode();
                TokenBody loginResponse = JsonConvert.DeserializeObject<TokenBody>(body);
                Token = loginResponse.Token;
                return true;
            }
            catch
            {
                MsgResponse msgResponse = JsonConvert.DeserializeObject<MsgResponse>(body);
                throw new Exception(msgResponse.Message);
            }
        }
        public static async Task<bool> Login(string name, string password) => await LoginOrRegister("login", name, password);
        public static async Task<bool> Register(string name, string password) => await LoginOrRegister("register", name, password);
        public static void LogOut() => Token = null;
        public static async Task<UserInfo> GetUserInfo()
        {
            HttpResponseMessage response = await http.GetAsync(URL + $"me?token={Token}");
            response.EnsureSuccessStatusCode();
            string body = await response.Content.ReadAsStringAsync();
            UserInfo user = JsonConvert.DeserializeObject<UserInfo>(body);
            return user;
        }
        public static async Task<List<Book>> GetBooks()
        {
            HttpResponseMessage response = await http.GetAsync(URL + "books");
            response.EnsureSuccessStatusCode();
            string body = await response.Content.ReadAsStringAsync();
            List<Book> books = JsonConvert.DeserializeObject<List<Book>>(body);
            return books;
        }
        public static async Task DeleteBook(int id)
        {
            HttpResponseMessage response = await http.DeleteAsync(URL + $"books/{id}?token={Token}");
            response.EnsureSuccessStatusCode();
        }
        public static async Task SendBook(Book book, bool edit)
        {
            string body = null;
            try
            {
                string json = JsonConvert.SerializeObject(book);
                HttpContent reqBody = new StringContent(json, Encoding.UTF8, "application/json");
                HttpResponseMessage response;
                if (edit) response = await http.PutAsync(URL + $"books/{book.Id}?token={Token}", reqBody);
                else response = await http.PostAsync(URL + $"books?token={Token}", reqBody);
                body = await response.Content.ReadAsStringAsync();
                response.EnsureSuccessStatusCode();
            }
            catch
            {
                MsgResponse msgResponse = JsonConvert.DeserializeObject<MsgResponse>(body);
                throw new Exception(msgResponse.Message);
            }
        }
    }
    public struct LoginBody
    {
        [JsonProperty("name")]
        public string Name { get; set; }
        [JsonProperty("password")]
        public string Password { get; set; }
        public LoginBody(string name, string password)
        {
            Name = name;
            Password = password;
        }
    }
    public struct TokenBody
    {
        [JsonProperty("token")]
        public string Token { get; set; }
    }
    public struct MsgResponse
    {
        [JsonProperty("msg")]
        public string Message { get; set; }
    }
    public struct UserInfo
    {
        [JsonProperty("name")]
        public string Name { get; set; }
        [JsonProperty("createdAt")]
        public DateTime CreatedAt { get; set; }
    }
}
