using Newtonsoft.Json;
using System;

namespace BookCatalog
{
    public class Review
    {
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("rating")]
        public int Rating { get; set; }

        [JsonProperty("content")] 
        public string Content { get; set; } 

        [JsonProperty("bookId")]
        public int BookId { get; set; }

        [JsonProperty("createdAt")]
        public DateTime CreatedAt { get; set; }

        [JsonProperty("user")]
        public Reviewer User { get; set; }

        public Review() { }
    }

    public struct Reviewer
    {
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }
    }
}