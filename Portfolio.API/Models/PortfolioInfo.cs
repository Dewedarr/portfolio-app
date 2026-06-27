namespace Portfolio.API.Models
{
    public class PortfolioInfo
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string LinkedIn { get; set; } = string.Empty;
        public string GitHub { get; set; } = string.Empty;
        public string YearsExperience { get; set; } = string.Empty;
        public string ProjectsCount { get; set; } = string.Empty;
        public string TechCount { get; set; } = string.Empty;
        public bool IsAvailable { get; set; } = true;
        public string TypingWords { get; set; } = ".NET Backend Developer,React Frontend Developer,Full Stack Engineer,Problem Solver";
        public string AvatarUrl { get; set; } = string.Empty;
    }
}