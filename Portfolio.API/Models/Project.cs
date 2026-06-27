namespace Portfolio.API.Models
{
    public class Project
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Icon { get; set; } = "🚀";
        public string BackgroundGradient { get; set; } = "linear-gradient(135deg,#0a1628,#0f2040)";
        public string Tags { get; set; } = string.Empty;
        public bool IsFeatured { get; set; } = false;
        public string GitHubUrl { get; set; } = string.Empty;
        public string LiveUrl { get; set; } = string.Empty;
        public int Order { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}