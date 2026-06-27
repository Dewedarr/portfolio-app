using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Portfolio.API.Data;
using Portfolio.API.Models;

namespace Portfolio.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ProjectsController(AppDbContext context) { _context = context; }

        [HttpGet]
        public async Task<IActionResult> GetAll() =>
            Ok(await _context.Projects.OrderBy(p => p.Order).ToListAsync());

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Project project)
        {
            project.CreatedAt = DateTime.UtcNow;
            _context.Projects.Add(project);
            await _context.SaveChangesAsync();
            return Ok(project);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Project updated)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null) return NotFound();
            project.Title = updated.Title;
            project.Description = updated.Description;
            project.Icon = updated.Icon;
            project.Tags = updated.Tags;
            project.IsFeatured = updated.IsFeatured;
            project.GitHubUrl = updated.GitHubUrl;
            project.LiveUrl = updated.LiveUrl;
            project.Order = updated.Order;
            project.BackgroundGradient = updated.BackgroundGradient;
            await _context.SaveChangesAsync();
            return Ok(project);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null) return NotFound();
            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Deleted" });
        }
    }
}