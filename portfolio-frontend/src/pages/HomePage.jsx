import { useState, useEffect, useRef } from 'react'
import { sendContact, getPortfolioInfo, getProjects, getSkills } from '../services/api'

const API_URL = 'https://portfolio-app-production-f4b8.up.railway.app'

export default function HomePage() {
  const canvasRef = useRef(null)
  const [typed, setTyped] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [info, setInfo] = useState(null)
  const [projects, setProjects] = useState([])
  const [skills, setSkills] = useState([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [infoRes, projRes, skillRes] = await Promise.all([
          getPortfolioInfo(), getProjects(), getSkills()
        ])
        setInfo(infoRes.data)
        setProjects(projRes.data)
        setSkills(skillRes.data)
      } catch (e) {
        console.error('Failed to load data', e)
      } finally {
        setDataLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    window.addEventListener('resize', handleResize)
    const pts = Array.from({length: 60}, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.2 + 0.3, o: Math.random() * 0.35 + 0.1
    }))
    let animId
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      pts.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,212,255,${p.o})`; ctx.fill()
        pts.forEach((p2, j) => {
          if (j <= i) return
          const dx = p.x - p2.x, dy = p.y - p2.y, d = Math.sqrt(dx*dx + dy*dy)
          if (d < 120) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(0,212,255,${0.07 * (1 - d/120)})`; ctx.lineWidth = 0.5; ctx.stroke()
          }
        })
      })
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', handleResize) }
  }, [])

  useEffect(() => {
    if (!info) return
    const words = info.typingWords
      ? info.typingWords.split(',').map(w => w.trim()).filter(Boolean)
      : ['.NET Backend Developer', 'React Frontend Developer', 'Full Stack Engineer', 'Problem Solver']
    let wi = 0, ci = 0, deleting = false
    let timeout
    const type = () => {
      const word = words[wi]
      if (!deleting) {
        ci++
        setTyped(word.substring(0, ci))
        if (ci >= word.length) { deleting = true; timeout = setTimeout(type, 1800); return }
      } else {
        ci--
        setTyped(word.substring(0, ci))
        if (ci <= 0) { deleting = false; wi = (wi + 1) % words.length; ci = 0 }
      }
      timeout = setTimeout(type, deleting ? 50 : 110)
    }
    timeout = setTimeout(type, 500)
    return () => clearTimeout(timeout)
  }, [info])

  const validate = () => {
    const e = {}
    if (!form.name || form.name.length < 2) e.name = 'Name must be at least 2 characters'
    if (!form.email.match(/^[^@]+@gmail\.com$/)) e.email = 'Email must be a Gmail address'
    if (!form.phone.match(/^\d{10,15}$/)) e.phone = 'Phone must be numbers only (10-15 digits)'
    if (!form.subject || form.subject.length < 3) e.subject = 'Subject must be at least 3 characters'
    if (!form.message || form.message.length < 10) e.message = 'Message must be at least 10 characters'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({}); setLoading(true)
    try {
      await sendContact(form)
      setSuccess(true)
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch { setErrors({ general: 'Something went wrong. Please try again.' }) }
    finally { setLoading(false) }
  }

  const handlePhone = (e) => setForm({ ...form, phone: e.target.value.replace(/[^0-9]/g, '') })

  const skillsByCategory = skills.reduce((acc, sk) => {
    if (!acc[sk.category]) acc[sk.category] = []
    acc[sk.category].push(sk)
    return acc
  }, {})

  const avatarSrc = info?.avatarUrl
    ? `${API_URL}${info.avatarUrl}`
    : '/avatar.jpg'

  if (dataLoading) return (
    <div style={{background:'#070a10',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{fontFamily:'monospace',color:'#00d4ff',fontSize:'1rem',letterSpacing:'3px'}}>Loading...</div>
    </div>
  )

  return (
    <div style={{background:'#070a10',color:'#e2e8f0',minHeight:'100vh',overflowX:'hidden'}}>
      <style>{`
        @keyframes pulse{0%,100%{box-shadow:0 0 6px #10b981;}50%{box-shadow:0 0 14px #10b981;}}
        @keyframes blink{0%,100%{opacity:1;}50%{opacity:0;}}
        @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px);}to{opacity:1;transform:translateY(0);}}
        .hero-left{animation:fadeUp .8s .2s both;}
        .hero-right{animation:fadeUp .8s .4s both;}
        .ring1{position:absolute;inset:-14px;border-radius:50%;border:1px dashed rgba(0,212,255,0.25);animation:spin 18s linear infinite;}
        .ring2{position:absolute;inset:-26px;border-radius:50%;border:1px dashed rgba(124,58,237,0.18);animation:spin 28s linear infinite reverse;}
        .nav-link:hover{color:#00d4ff !important;}
        .proj-card:hover{border-color:rgba(0,212,255,0.4) !important;transform:translateY(-6px);}
        .contact-item:hover{border-color:#00d4ff !important;transform:translateX(5px);}
        .soc:hover{border-color:#00d4ff !important;color:#00d4ff !important;}
        .hamburger{display:none;flex-direction:column;gap:5px;cursor:pointer;padding:4px;}
        .hamburger span{display:block;width:22px;height:2px;background:#00d4ff;border-radius:2px;transition:all .3s;}
        .mobile-menu{display:none;position:fixed;top:60px;left:0;right:0;background:rgba(7,10,16,0.98);border-bottom:1px solid rgba(0,212,255,0.1);padding:1rem;flex-direction:column;gap:1rem;z-index:99;}
        .mobile-menu.open{display:flex;}
        .mobile-menu a{color:#64748b;text-decoration:none;font-family:monospace;font-size:0.85rem;letter-spacing:2px;text-transform:uppercase;padding:0.5rem 0;border-bottom:1px solid #1a2744;}
        @media(max-width:768px){
          .nav-links{display:none !important;}
          .hamburger{display:flex !important;}
          .hero-grid{grid-template-columns:1fr !important;}
          .hero-right{display:none !important;}
          .hero-btns{justify-content:center !important;}
          .contact-grid{grid-template-columns:1fr !important;}
          .skills-grid{grid-template-columns:1fr !important;}
          .proj-grid{grid-template-columns:1fr !important;}
          .form-row{grid-template-columns:1fr !important;}
          .stats-box{flex-wrap:wrap;}
        }
      `}</style>

      <canvas ref={canvasRef} style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',zIndex:0,pointerEvents:'none',opacity:0.4}}/>

      {/* NAV */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,padding:'1rem 1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center',backdropFilter:'blur(30px)',background:'rgba(7,10,16,0.88)',borderBottom:'1px solid rgba(0,212,255,0.08)'}}>
        <div style={{fontFamily:'monospace',fontSize:'1rem',color:'#00d4ff',letterSpacing:'3px'}}>AD<span style={{color:'#64748b'}}>.</span></div>
        <div className="nav-links" style={{display:'flex',gap:'2rem'}}>
          {['About','Skills','Projects','Contact'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} className="nav-link" style={{color:'#64748b',textDecoration:'none',fontSize:'0.72rem',letterSpacing:'2px',textTransform:'uppercase',fontFamily:'monospace',transition:'color .3s'}}>{item}</a>
          ))}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
          <a href="/login" style={{border:'1px solid #00d4ff',color:'#00d4ff',padding:'0.35rem 0.9rem',borderRadius:'3px',fontFamily:'monospace',fontSize:'0.68rem',letterSpacing:'2px',textDecoration:'none',whiteSpace:'nowrap'}}>Admin</a>
          <div className="hamburger" onClick={()=>setMenuOpen(!menuOpen)}>
            <span></span><span></span><span></span>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${menuOpen?'open':''}`}>
        {['About','Skills','Projects','Contact'].map(item => (
          <a key={item} href={`#${item.toLowerCase()}`} onClick={()=>setMenuOpen(false)}>{item}</a>
        ))}
      </div>

      {/* HERO */}
      <section style={{position:'relative',zIndex:1,minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'7rem 1.5rem 4rem'}}>
        <div className="hero-grid" style={{maxWidth:'1100px',width:'100%',display:'grid',gridTemplateColumns:'1fr 240px',gap:'4rem',alignItems:'center'}}>
          <div className="hero-left">
            <div style={{display:'inline-flex',alignItems:'center',gap:'0.6rem',border:'1px solid rgba(0,212,255,0.25)',borderRadius:'20px',padding:'0.4rem 1.2rem',fontFamily:'monospace',fontSize:'0.65rem',color:'#00d4ff',letterSpacing:'3px',marginBottom:'1.5rem',background:'rgba(0,212,255,0.04)'}}>
              <span style={{width:'6px',height:'6px',borderRadius:'50%',background:info?.isAvailable?'#10b981':'#64748b',animation:info?.isAvailable?'pulse 2s infinite':'none'}}></span>
              {info?.isAvailable ? 'Available for new opportunities' : 'Not available right now'}
            </div>
            <h1 style={{fontSize:'clamp(2.8rem,8vw,6.5rem)',fontWeight:800,lineHeight:0.95,marginBottom:'1.2rem',letterSpacing:'-2px'}}>
              <span style={{display:'block',color:'#e2e8f0'}}>{info?.fullName?.split(' ')[0] || 'Ahmed'}</span>
              <span style={{display:'block',background:'linear-gradient(135deg,#00d4ff 0%,#7c3aed 50%,#f59e0b 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>{info?.fullName?.split(' ').slice(1).join(' ') || 'Dewedar'}</span>
            </h1>
            <div style={{fontFamily:'monospace',fontSize:'clamp(0.8rem,3vw,1.05rem)',color:'#64748b',marginBottom:'1.2rem',minHeight:'1.6em'}}>
              {typed}<span style={{display:'inline-block',width:'2px',height:'1em',background:'#00d4ff',marginLeft:'3px',animation:'blink 1s infinite',verticalAlign:'middle'}}></span>
            </div>
            <p style={{color:'#64748b',lineHeight:1.8,maxWidth:'520px',marginBottom:'2rem',fontSize:'clamp(0.85rem,2.5vw,1rem)'}}>
              {info?.bio || 'I build high-performance systems that scale.'}
            </p>
            <div className="hero-btns" style={{display:'flex',gap:'1rem',flexWrap:'wrap',marginBottom:'2.5rem'}}>
              <a href="#projects" style={{padding:'0.8rem 1.8rem',background:'#00d4ff',color:'#000',borderRadius:'4px',fontWeight:700,fontSize:'0.85rem',cursor:'pointer',letterSpacing:'1px',textDecoration:'none',transition:'all .3s'}}>View My Work</a>
              <a href="#contact" style={{padding:'0.8rem 1.8rem',background:'transparent',color:'#e2e8f0',border:'1px solid #1a2744',borderRadius:'4px',fontWeight:700,fontSize:'0.85rem',cursor:'pointer',letterSpacing:'1px',textDecoration:'none',transition:'all .3s'}}>Get In Touch</a>
            </div>
            <div className="stats-box" style={{display:'inline-flex',border:'1px solid #1a2744',borderRadius:'8px',overflow:'hidden',background:'#0b1120'}}>
              {[[info?.yearsExperience||'2+','Years Exp'],[info?.projectsCount||'5+','Projects'],[info?.techCount||'10+','Technologies']].map(([num,label],i,arr) => (
                <div key={label} style={{padding:'1rem 1.5rem',textAlign:'center',borderRight:i<arr.length-1?'1px solid #1a2744':'none'}}>
                  <div style={{fontSize:'1.8rem',fontWeight:800,fontFamily:'monospace',background:'linear-gradient(135deg,#00d4ff,#7c3aed)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>{num}</div>
                  <div style={{fontSize:'0.58rem',color:'#64748b',textTransform:'uppercase',letterSpacing:'2px',marginTop:'0.3rem',fontFamily:'monospace'}}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-right" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'16px'}}>
            <div style={{position:'relative',cursor:'pointer',width:'180px',height:'180px'}}>
              <div className="ring1"></div>
              <div className="ring2"></div>
              <div style={{width:'160px',height:'160px',borderRadius:'50%',overflow:'hidden',border:'2px solid rgba(0,212,255,0.4)',position:'relative',margin:'10px auto',boxShadow:'0 0 30px rgba(0,212,255,0.1)'}}>
                <img src={avatarSrc} alt={info?.fullName} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center 20%'}} onError={e=>e.target.src='/avatar.jpg'}/>
              </div>
              <div style={{position:'absolute',bottom:'4px',left:'50%',transform:'translateX(-50%)',background:'rgba(7,10,16,0.92)',border:'1px solid rgba(16,185,129,0.5)',borderRadius:'20px',padding:'3px 10px',display:'flex',alignItems:'center',gap:'5px',whiteSpace:'nowrap',zIndex:2}}>
                <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'#10b981',animation:'pulse 2s infinite'}}></span>
                <span style={{fontFamily:'monospace',color:'#10b981',fontSize:'9px',letterSpacing:'1px'}}>{info?.isAvailable ? 'Open to Work' : 'Not Available'}</span>
              </div>
            </div>
            <div style={{background:'#0b1120',border:'1px solid #1a2744',borderRadius:'10px',padding:'14px 18px',textAlign:'center',width:'100%',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:'1px',background:'linear-gradient(to right,transparent,#00d4ff,transparent)'}}></div>
              <div style={{fontWeight:700,fontSize:'0.95rem',marginBottom:'3px'}}>{info?.fullName}</div>
              <div style={{fontFamily:'monospace',color:'#00d4ff',fontSize:'0.62rem',letterSpacing:'2px',marginBottom:'4px'}}>{'//'} Full Stack Dev</div>
              <div style={{fontFamily:'monospace',color:'#64748b',fontSize:'0.6rem'}}>📍 {info?.location}</div>
            </div>
          </div>
        </div>
      </section>

      {/* SKILLS */}
      <section id="skills" style={{position:'relative',zIndex:1,padding:'5rem 1.5rem',background:'#0a0f1a'}}>
        <div style={{maxWidth:'1100px',margin:'0 auto'}}>
          <div style={{fontFamily:'monospace',fontSize:'0.65rem',color:'#00d4ff',letterSpacing:'4px',textTransform:'uppercase',marginBottom:'0.5rem',display:'flex',alignItems:'center',gap:'0.75rem'}}>
            <span style={{width:'24px',height:'1px',background:'#00d4ff'}}></span>tech stack
          </div>
          <h2 style={{fontSize:'clamp(1.8rem,5vw,3rem)',fontWeight:800,marginBottom:'2.5rem',letterSpacing:'-1px'}}>What I Work With</h2>
          <div className="skills-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem'}}>
            {Object.entries(skillsByCategory).map(([cat, catSkills]) => (
              <div key={cat} style={{background:'#0b1120',border:'1px solid #1a2744',borderRadius:'10px',padding:'1.25rem'}}>
                <div style={{fontFamily:'monospace',fontSize:'0.7rem',letterSpacing:'3px',textTransform:'uppercase',marginBottom:'1rem',display:'flex',alignItems:'center',gap:'0.6rem',color:catSkills[0]?.color||'#00d4ff'}}>
                  <span style={{width:'16px',height:'1px',background:catSkills[0]?.color||'#00d4ff'}}></span>{cat}
                </div>
                {catSkills.map(sk => (
                  <div key={sk.id} style={{fontSize:'0.82rem',color:'#94a3b8',padding:'0.5rem 0',borderBottom:'1px solid #1a2744',display:'flex',alignItems:'center',gap:'0.5rem'}}>
                    <span style={{color:'#00d4ff',fontSize:'0.7rem'}}>▹</span>{sk.name}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects" style={{position:'relative',zIndex:1,padding:'5rem 1.5rem'}}>
        <div style={{maxWidth:'1100px',margin:'0 auto'}}>
          <div style={{fontFamily:'monospace',fontSize:'0.65rem',color:'#00d4ff',letterSpacing:'4px',textTransform:'uppercase',marginBottom:'0.5rem',display:'flex',alignItems:'center',gap:'0.75rem'}}>
            <span style={{width:'24px',height:'1px',background:'#00d4ff'}}></span>portfolio
          </div>
          <h2 style={{fontSize:'clamp(1.8rem,5vw,3rem)',fontWeight:800,marginBottom:'2.5rem',letterSpacing:'-1px'}}>Featured Projects</h2>
          <div className="proj-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'1rem'}}>
            {projects.map((p, idx) => (
              <div key={p.id} className="proj-card" style={{background:'#0b1120',border:'1px solid #1a2744',borderRadius:'10px',overflow:'hidden',transition:'all .35s',cursor:'pointer'}}>
                <div style={{height:'140px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2.8rem',position:'relative',background:p.backgroundGradient||'linear-gradient(135deg,#0a1628,#0f2040)'}}>
                  {p.icon}
                  <span style={{position:'absolute',top:'0.75rem',left:'0.85rem',fontFamily:'monospace',fontSize:'0.6rem',color:'rgba(0,212,255,0.6)',letterSpacing:'2px'}}>0{idx+1}</span>
                  {p.isFeatured && <span style={{position:'absolute',top:'0.75rem',right:'0.85rem',background:'rgba(245,158,11,0.12)',border:'1px solid rgba(245,158,11,0.3)',color:'#f59e0b',fontSize:'0.6rem',fontFamily:'monospace',padding:'2px 7px',borderRadius:'2px'}}>Featured</span>}
                </div>
                <div style={{padding:'1rem'}}>
                  <h3 style={{fontSize:'0.95rem',fontWeight:700,marginBottom:'0.4rem'}}>{p.title}</h3>
                  <p style={{fontSize:'0.8rem',color:'#64748b',lineHeight:1.6,marginBottom:'0.75rem'}}>{p.description}</p>
                  <div style={{display:'flex',flexWrap:'wrap',gap:'0.3rem'}}>
                    {p.tags?.split(',').map(t=>t.trim()).filter(Boolean).map(t=>(
                      <span key={t} style={{fontFamily:'monospace',fontSize:'0.58rem',padding:'2px 6px',background:'rgba(0,212,255,0.06)',border:'1px solid rgba(0,212,255,0.18)',color:'#00d4ff',borderRadius:'2px'}}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{position:'relative',zIndex:1,padding:'5rem 1.5rem',background:'#0a0f1a'}}>
        <div className="contact-grid" style={{maxWidth:'1100px',margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1.1fr',gap:'3rem',alignItems:'start'}}>
          <div>
            <div style={{fontFamily:'monospace',fontSize:'0.65rem',color:'#00d4ff',letterSpacing:'4px',textTransform:'uppercase',marginBottom:'0.5rem',display:'flex',alignItems:'center',gap:'0.75rem'}}>
              <span style={{width:'24px',height:'1px',background:'#00d4ff'}}></span>contact
            </div>
            <h2 style={{fontSize:'clamp(1.5rem,4vw,2.8rem)',fontWeight:800,lineHeight:1.15,marginBottom:'1rem',letterSpacing:'-1px'}}>
              Let's Build Something{' '}
              <span style={{background:'linear-gradient(135deg,#00d4ff,#7c3aed)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Great Together</span>
            </h2>
            <p style={{color:'#64748b',fontSize:'0.9rem',lineHeight:1.8,marginBottom:'1.5rem'}}>Have a project in mind? I'm open to new opportunities.</p>
            <div style={{display:'flex',flexDirection:'column',gap:'0.6rem'}}>
              {[
                {icon:'✉️',label:'Email',val:info?.email||'ahmed.dewedar@gmail.com'},
                {icon:'💼',label:'LinkedIn',val:info?.linkedIn||'linkedin.com/in/ahmeddewedar'},
                {icon:'🐙',label:'GitHub',val:info?.gitHub||'github.com/ahmeddewedar'},
                {icon:'📍',label:'Location',val:info?.location||'Giza, Egypt · Open to Remote'},
              ].map(item => (
                <div key={item.label} className="contact-item" style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.75rem 1rem',background:'#0b1120',border:'1px solid #1a2744',borderRadius:'8px',transition:'all .3s',cursor:'pointer'}}>
                  <span>{item.icon}</span>
                  <div>
                    <div style={{fontFamily:'monospace',fontSize:'0.58rem',color:'#64748b',letterSpacing:'1px',textTransform:'uppercase'}}>{item.label}</div>
                    <div style={{fontSize:'0.82rem',fontWeight:600,wordBreak:'break-all'}}>{item.val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{background:'#0b1120',border:'1px solid #1a2744',borderRadius:'12px',padding:'1.5rem',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:0,left:0,right:0,height:'1px',background:'linear-gradient(to right,transparent,#00d4ff,transparent)'}}></div>
            <div style={{fontFamily:'monospace',fontSize:'0.62rem',color:'#00d4ff',letterSpacing:'3px',textTransform:'uppercase',marginBottom:'1rem',display:'flex',alignItems:'center',gap:'0.6rem'}}>
              <span style={{width:'16px',height:'1px',background:'#00d4ff'}}></span>Send a Message
            </div>
            {success && <div style={{background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.3)',color:'#10b981',borderRadius:'8px',padding:'0.75rem',marginBottom:'1rem',fontSize:'0.85rem'}}>✓ Message sent successfully!</div>}
            {errors.general && <div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',color:'#f87171',borderRadius:'8px',padding:'0.75rem',marginBottom:'1rem',fontSize:'0.85rem'}}>{errors.general}</div>}
            <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
              <div className="form-row" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem'}}>
                {[['name','Name','Your name'],['email','Email','name@gmail.com']].map(([field,label,ph])=>(
                  <div key={field}>
                    <label style={{fontFamily:'monospace',fontSize:'0.58rem',color:'#64748b',letterSpacing:'2px',textTransform:'uppercase',display:'block',marginBottom:'0.4rem'}}>{label}</label>
                    <input value={form[field]} onChange={e=>setForm({...form,[field]:e.target.value})} placeholder={ph}
                      style={{width:'100%',background:'#0f1624',border:`1px solid ${errors[field]?'#ef4444':'#1a2744'}`,borderRadius:'5px',padding:'0.65rem 0.85rem',color:'#e2e8f0',fontSize:'0.82rem',outline:'none',boxSizing:'border-box'}}/>
                    {errors[field] && <p style={{color:'#f87171',fontSize:'0.68rem',marginTop:'3px'}}>{errors[field]}</p>}
                  </div>
                ))}
              </div>
              {[['phone','Phone','01012345678',true],['subject','Subject','Project inquiry...',false]].map(([field,label,ph,isPhone])=>(
                <div key={field}>
                  <label style={{fontFamily:'monospace',fontSize:'0.58rem',color:'#64748b',letterSpacing:'2px',textTransform:'uppercase',display:'block',marginBottom:'0.4rem'}}>{label}</label>
                  <input value={form[field]} onChange={isPhone?handlePhone:e=>setForm({...form,[field]:e.target.value})} maxLength={isPhone?15:undefined} placeholder={ph}
                    style={{width:'100%',background:'#0f1624',border:`1px solid ${errors[field]?'#ef4444':'#1a2744'}`,borderRadius:'5px',padding:'0.65rem 0.85rem',color:'#e2e8f0',fontSize:'0.82rem',outline:'none',boxSizing:'border-box'}}/>
                  {errors[field] && <p style={{color:'#f87171',fontSize:'0.68rem',marginTop:'3px'}}>{errors[field]}</p>}
                </div>
              ))}
              <div>
                <label style={{fontFamily:'monospace',fontSize:'0.58rem',color:'#64748b',letterSpacing:'2px',textTransform:'uppercase',display:'block',marginBottom:'0.4rem'}}>Message</label>
                <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} rows={4} placeholder="Tell me about your project..."
                  style={{width:'100%',background:'#0f1624',border:`1px solid ${errors.message?'#ef4444':'#1a2744'}`,borderRadius:'5px',padding:'0.65rem 0.85rem',color:'#e2e8f0',fontSize:'0.82rem',outline:'none',resize:'none',boxSizing:'border-box'}}/>
                {errors.message && <p style={{color:'#f87171',fontSize:'0.68rem',marginTop:'3px'}}>{errors.message}</p>}
              </div>
              <button type="submit" disabled={loading}
                style={{width:'100%',padding:'0.85rem',background:'linear-gradient(135deg,#00d4ff,#0ea5e9)',color:'#000',border:'none',borderRadius:'5px',fontWeight:700,fontSize:'0.85rem',cursor:'pointer',opacity:loading?0.6:1}}>
                {loading ? 'Sending...' : '✉️ Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{position:'relative',zIndex:1,background:'#0a0f1a',borderTop:'1px solid #1a2744',padding:'1.5rem'}}>
        <div style={{maxWidth:'1100px',margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem'}}>
          <div style={{fontFamily:'monospace',color:'#00d4ff',letterSpacing:'2px'}}>AD.</div>
          <div style={{fontFamily:'monospace',fontSize:'0.62rem',color:'#64748b'}}>© 2024 {info?.fullName} · Built with passion</div>
          <div style={{display:'flex',gap:'0.75rem'}}>
            {[['G',info?.gitHub],['L',info?.linkedIn],['E',info?.email]].map(([s,link]) => (
              <a key={s} href={link?`https://${link}`:'#'} target="_blank" rel="noreferrer" className="soc" style={{width:'32px',height:'32px',border:'1px solid #1a2744',borderRadius:'5px',display:'flex',alignItems:'center',justifyContent:'center',color:'#64748b',fontSize:'0.8rem',textDecoration:'none',transition:'all .3s'}}>{s}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
