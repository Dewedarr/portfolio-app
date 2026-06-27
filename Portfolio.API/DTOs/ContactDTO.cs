using System.ComponentModel.DataAnnotations;

namespace Portfolio.API.DTOs
{
    public class ContactRequestDTO
    {
        [Required]
        [MinLength(2)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [RegularExpression(@"^[^@]+@gmail\.com$", ErrorMessage = "Email must be a Gmail address")]
        public string Email { get; set; } = string.Empty;

        [Required]
        [RegularExpression(@"^\d{10,15}$", ErrorMessage = "Phone must be numbers only, 10-15 digits")]
        public string Phone { get; set; } = string.Empty;

        [Required]
        [MinLength(3)]
        public string Subject { get; set; } = string.Empty;

        [Required]
        [MinLength(10)]
        public string Message { get; set; } = string.Empty;
    }

    public class LoginDTO
    {
        [Required]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}