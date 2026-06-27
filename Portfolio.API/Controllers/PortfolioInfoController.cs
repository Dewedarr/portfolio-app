using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Portfolio.API.Data;
using Portfolio.API.Models;

namespace Portfolio.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PortfolioInfoController : ControllerBase
    {
        private readonly AppDbContext _context;
        public PortfolioInfoController(AppDbContext context) { _context = context; }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var info = await _context.PortfolioInfos.FirstOrDefaultAsync();
            return Ok(info);
        }

        [Authorize]
        [HttpPut]
        public async Task<IActionResult> Update([FromBody] PortfolioInfo updated)
        {
            var info = await _context.PortfolioInfos.FirstOrDefaultAsync();
            if (info == null)
            {
                _context.PortfolioInfos.Add(updated);
                await _context.SaveChangesAsync();
                return Ok(updated);
            }
            info.FullName = updated.FullName;
            info.Title = updated.Title;
            info.Bio = updated.Bio;
            info.Location = updated.Location;
            info.Email = updated.Email;
            info.LinkedIn = updated.LinkedIn;
            info.GitHub = updated.GitHub;
            info.YearsExperience = updated.YearsExperience;
            info.ProjectsCount = updated.ProjectsCount;
            info.TechCount = updated.TechCount;
            info.IsAvailable = updated.IsAvailable;
            info.TypingWords = updated.TypingWords;
            info.AvatarUrl = updated.AvatarUrl;
            await _context.SaveChangesAsync();
            return Ok(info);
        }
    }
}