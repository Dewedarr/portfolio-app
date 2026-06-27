namespace Portfolio.API.Models
{
    public class Skill
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Color { get; set; } = "#00d4ff";
        public int Order { get; set; } = 0;
    }
}