using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Portfolio.API.Data;
using Portfolio.API.DTOs;
using Portfolio.API.Models;
using Microsoft.AspNetCore.Authorization;

namespace Portfolio.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContactController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ContactController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/contact — زوار الموقع يبعتوا رسالة
        [HttpPost]
        public async Task<IActionResult> SendMessage([FromBody] ContactRequestDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var contact = new ContactRequest
            {
                Name = dto.Name,
                Email = dto.Email,
                Phone = dto.Phone,
                Subject = dto.Subject,
                Message = dto.Message,
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };

            _context.ContactRequests.Add(contact);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Message sent successfully!" });
        }

        // GET: api/contact — Admin بس يشوف الرسائل
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var contacts = await _context.ContactRequests
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
            return Ok(contacts);
        }

        // PUT: api/contact/{id}/read — Admin يعلم الرسالة كمقروءة
        [Authorize]
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var contact = await _context.ContactRequests.FindAsync(id);
            if (contact == null) return NotFound();

            contact.IsRead = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Marked as read" });
        }

        // DELETE: api/contact/{id} — Admin يحذف رسالة
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var contact = await _context.ContactRequests.FindAsync(id);
            if (contact == null) return NotFound();

            _context.ContactRequests.Remove(contact);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Deleted successfully" });
        }
    }
}