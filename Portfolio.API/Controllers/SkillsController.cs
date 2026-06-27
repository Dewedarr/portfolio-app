using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Portfolio.API.Data;
using Portfolio.API.Models;

namespace Portfolio.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SkillsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public SkillsController(AppDbContext context) { _context = context; }

        [HttpGet]
        public async Task<IActionResult> GetAll() =>
            Ok(await _context.Skills.OrderBy(s => s.Category).ThenBy(s => s.Order).ToListAsync());

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Skill skill)
        {
            _context.Skills.Add(skill);
            await _context.SaveChangesAsync();
            return Ok(skill);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Skill updated)
        {
            var skill = await _context.Skills.FindAsync(id);
            if (skill == null) return NotFound();
            skill.Name = updated.Name;
            skill.Category = updated.Category;
            skill.Color = updated.Color;
            skill.Order = updated.Order;
            await _context.SaveChangesAsync();
            return Ok(skill);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var skill = await _context.Skills.FindAsync(id);
            if (skill == null) return NotFound();
            _context.Skills.Remove(skill);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Deleted" });
        }
    }
}