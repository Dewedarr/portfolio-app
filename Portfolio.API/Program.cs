using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Portfolio.API.Data;
using Portfolio.API.Models;
using Portfolio.API.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddScoped<TokenService>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "https://portfolio-o9flpgw0t-dewedarrs-projects.vercel.app", "https://portfolio-pte88ltxq-dewedarrs-projects.vercel.app")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    context.Database.Migrate();

    // Seed Admin
    if (!context.AdminUsers.Any())
    {
        context.AdminUsers.Add(new AdminUser
        {
            Username = "admin",
            Email = "admin@portfolio.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            CreatedAt = DateTime.UtcNow
        });
    }

    // Seed Portfolio Info
    if (!context.PortfolioInfos.Any())
    {
        context.PortfolioInfos.Add(new PortfolioInfo
        {
            FullName = "Ahmed Dewedar",
            Title = ".NET Backend + React Frontend Developer",
            Bio = "I build high-performance systems that scale. Backend precision with .NET — Frontend clarity with React. Giza-based. Globally ready.",
            Location = "Giza, Egypt",
            Email = "ahmed.dewedar@gmail.com",
            LinkedIn = "linkedin.com/in/ahmeddewedar",
            GitHub = "github.com/ahmeddewedar",
            YearsExperience = "2+",
            ProjectsCount = "5+",
            TechCount = "10+",
            IsAvailable = true,
            TypingWords = ".NET Backend Developer,React Frontend Developer,Full Stack Engineer,Problem Solver",
            AvatarUrl = ""
        });
    }

    // Seed Projects
    if (!context.Projects.Any())
    {
        context.Projects.AddRange(
            new Project { Title = "E-Commerce Platform", Description = "Full-featured store with cart, Stripe payments, order tracking, and admin dashboard.", Icon = "🛒", Tags = ".NET Core,React,SQL Server,Stripe", IsFeatured = false, Order = 1, BackgroundGradient = "linear-gradient(135deg,#0a1628,#0f2040)" },
            new Project { Title = "HR Management System", Description = "Enterprise HR with employee management, payroll, and role-based access control.", Icon = "👥", Tags = ".NET Core,React,SignalR,JWT", IsFeatured = true, Order = 2, BackgroundGradient = "linear-gradient(135deg,#0f0a28,#1a0f40)" },
            new Project { Title = "Smart Booking System", Description = "Appointment platform with interactive calendar, email notifications, and analytics.", Icon = "📅", Tags = ".NET Core,React,Hangfire,SendGrid", IsFeatured = false, Order = 3, BackgroundGradient = "linear-gradient(135deg,#1a1000,#2a1a00)" },
            new Project { Title = "Blog Platform", Description = "Content platform with rich text editor, nested comments, likes, and admin panel.", Icon = "✍️", Tags = ".NET Core,React,SignalR,Azure", IsFeatured = false, Order = 4, BackgroundGradient = "linear-gradient(135deg,#001a0f,#002a1a)" },
            new Project { Title = "Task Manager Pro", Description = "Kanban-style task manager with drag & drop, priorities, and team collaboration.", Icon = "✅", Tags = ".NET Core,React,SQL Server,JWT", IsFeatured = false, Order = 5, BackgroundGradient = "linear-gradient(135deg,#1a000f,#2a0018)" }
        );
    }

    // Seed Skills
    if (!context.Skills.Any())
    {
        context.Skills.AddRange(
            new Skill { Name = ".NET Core / ASP.NET", Category = "Backend", Color = "#00d4ff", Order = 1 },
            new Skill { Name = "C#", Category = "Backend", Color = "#00d4ff", Order = 2 },
            new Skill { Name = "REST API / Web API", Category = "Backend", Color = "#00d4ff", Order = 3 },
            new Skill { Name = "Entity Framework Core", Category = "Backend", Color = "#00d4ff", Order = 4 },
            new Skill { Name = "JWT Auth", Category = "Backend", Color = "#00d4ff", Order = 5 },
            new Skill { Name = "SignalR", Category = "Backend", Color = "#00d4ff", Order = 6 },
            new Skill { Name = "React.js", Category = "Frontend", Color = "#7c3aed", Order = 1 },
            new Skill { Name = "JavaScript / TypeScript", Category = "Frontend", Color = "#7c3aed", Order = 2 },
            new Skill { Name = "Tailwind CSS", Category = "Frontend", Color = "#7c3aed", Order = 3 },
            new Skill { Name = "HTML5 / CSS3", Category = "Frontend", Color = "#7c3aed", Order = 4 },
            new Skill { Name = "React Query", Category = "Frontend", Color = "#7c3aed", Order = 5 },
            new Skill { Name = "Redux", Category = "Frontend", Color = "#7c3aed", Order = 6 },
            new Skill { Name = "SQL Server", Category = "Tools & DB", Color = "#f59e0b", Order = 1 },
            new Skill { Name = "Git / GitHub", Category = "Tools & DB", Color = "#f59e0b", Order = 2 },
            new Skill { Name = "Docker (Basics)", Category = "Tools & DB", Color = "#f59e0b", Order = 3 },
            new Skill { Name = "Postman / Swagger", Category = "Tools & DB", Color = "#f59e0b", Order = 4 },
            new Skill { Name = "Azure", Category = "Tools & DB", Color = "#f59e0b", Order = 5 },
            new Skill { Name = "Figma", Category = "Tools & DB", Color = "#f59e0b", Order = 6 }
        );
    }

    context.SaveChanges();
}

// Create wwwroot/uploads folder
var wwwroot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
Directory.CreateDirectory(wwwroot);

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowReact");
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
