import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  getContacts, markAsRead, deleteContact,
  getProjects, createProject, updateProject, deleteProject,
  getSkills, createSkill, updateSkill, deleteSkill,
  getPortfolioInfo, updatePortfolioInfo, uploadAvatar
} from '../services/api'

const s = {
  page: {background:'#070a10',minHeight:'100vh',color:'#e2e8f0'},
  nav: {background:'#0b1120',borderBottom:'1px solid #1a2744',padding:'1rem 1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,zIndex:50},
  logo: {fontFamily:'monospace',color:'#00d4ff',letterSpacing:'2px',fontSize:'1rem'},
  tabBar: {display:'flex',gap:'0.5rem',padding:'1rem 1.5rem',borderBottom:'1px solid #1a2744',background:'#0a0f1a',flexWrap:'wrap'},
  tab: (active) => ({padding:'0.5rem 1.2rem',borderRadius:'6px',border:'1px solid',borderColor:active?'#00d4ff':'#1a2744',background:active?'rgba(0,212,255,0.1)':'transparent',color:active?'#00d4ff':'#64748b',cursor:'pointer',fontFamily:'monospace',fontSize:'0.72rem',letterSpacing:'1px',transition:'all .2s'}),
  container: {padding:'1.5rem',maxWidth:'1100px',margin:'0 auto'},
  card: {background:'#0b1120',border:'1px solid #1a2744',borderRadius:'10px',padding:'1.25rem',marginBottom:'1rem'},
  input: (err) => ({width:'100%',background:'#0f1624',border:`1px solid ${err?'#ef4444':'#1a2744'}`,borderRadius:'6px',padding:'0.65rem 0.9rem',color:'#e2e8f0',fontFamily:'sans-serif',fontSize:'0.85rem',outline:'none',boxSizing:'border-box',marginBottom:'0.5rem'}),
  label: {fontFamily:'monospace',fontSize:'0.6rem',color:'#64748b',letterSpacing:'2px',textTransform:'uppercase',display:'block',marginBottom:'0.3rem'},
  btnPrimary: {background:'#00d4ff',color:'#000',border:'none',padding:'0.6rem 1.4rem',borderRadius:'6px',fontWeight:700,fontSize:'0.82rem',cursor:'pointer',letterSpacing:'1px'},
  btnDanger: {background:'transparent',color:'#f87171',border:'1px solid rgba(248,113,113,0.3)',padding:'0.5rem 1rem',borderRadius:'6px',fontSize:'0.78rem',cursor:'pointer',transition:'all .2s'},
  btnEdit: {background:'transparent',color:'#00d4ff',border:'1px solid rgba(0,212,255,0.3)',padding:'0.5rem 1rem',borderRadius:'6px',fontSize:'0.78rem',cursor:'pointer',transition:'all .2s'},
  btnSuccess: {background:'rgba(16,185,129,0.1)',color:'#10b981',border:'1px solid rgba(16,185,129,0.3)',padding:'0.6rem 1.4rem',borderRadius:'6px',fontWeight:700,fontSize:'0.82rem',cursor:'pointer'},
  grid2: {display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'},
  sectionTitle: {fontFamily:'monospace',fontSize:'0.65rem',color:'#00d4ff',letterSpacing:'3px',textTransform:'uppercase',marginBottom:'1rem',display:'flex',alignItems:'center',gap:'0.5rem'},
  statCard: {background:'#0b1120',border:'1px solid #1a2744',borderRadius:'10px',padding:'1.25rem',textAlign:'center'},
  statNum: {fontSize:'2rem',fontWeight:800,fontFamily:'monospace',background:'linear-gradient(135deg,#00d4ff,#7c3aed)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'},
  statLabel: {fontSize:'0.65rem',color:'#64748b',textTransform:'uppercase',letterSpacing:'2px',fontFamily:'monospace',marginTop:'0.3rem'},
  badge: (read) => ({display:'inline-block',padding:'2px 8px',borderRadius:'4px',fontSize:'0.65rem',fontFamily:'monospace',background:read?'rgba(100,116,139,0.1)':'rgba(0,212,255,0.1)',border:`1px solid ${read?'#1a2744':'rgba(0,212,255,0.3)'}`,color:read?'#64748b':'#00d4ff'}),
  row: {display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'1rem'},
  divider: {borderColor:'#1a2744',margin:'1rem 0'},
  msg: (type) => ({padding:'0.75rem 1rem',borderRadius:'6px',marginBottom:'1rem',fontSize:'0.85rem',background:type==='success'?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)',border:`1px solid ${type==='success'?'rgba(16,185,129,0.3)':'rgba(239,68,68,0.3)'}`,color:type==='success'?'#10b981':'#f87171'}),
  toggle: (on) => ({width:'44px',height:'22px',borderRadius:'11px',background:on?'#00d4ff':'#1a2744',border:'none',cursor:'pointer',position:'relative',transition:'background .3s',flexShrink:0}),
}

const emptyProject = {title:'',description:'',icon:'🚀',tags:'',isFeatured:false,gitHubUrl:'',liveUrl:'',order:0,backgroundGradient:'linear-gradient(135deg,#0a1628,#0f2040)'}
const emptySkill = {name:'',category:'Backend',color:'#00d4ff',order:0}

export default function AdminPage() {
  const { admin, logoutAdmin } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('dashboard')
  const [msg, setMsg] = useState(null)
  const [contacts, setContacts] = useState([])
  const [projects, setProjects] = useState([])
  const [skills, setSkills] = useState([])
  const [info, setInfo] = useState(null)
  const [projForm, setProjForm] = useState(emptyProject)
  const [editingProj, setEditingProj] = useState(null)
  const [showProjForm, setShowProjForm] = useState(false)
  const [skillForm, setSkillForm] = useState(emptySkill)
  const [editingSkill, setEditingSkill] = useState(null)
  const [showSkillForm, setShowSkillForm] = useState(false)
  const [contactFilter, setContactFilter] = useState('all')
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)

  const showMsg = (text, type='success') => {
    setMsg({text, type})
    setTimeout(() => setMsg(null), 3000)
  }

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const [c, p, sk, i] = await Promise.all([getContacts(), getProjects(), getSkills(), getPortfolioInfo()])
      setContacts(c.data)
      setProjects(p.data)
      setSkills(sk.data)
      const infoData = i.data || {fullName:'Ahmed Dewedar',title:'.NET Backend + React Frontend Developer',bio:'',location:'Giza, Egypt',email:'',linkedIn:'',gitHub:'',yearsExperience:'2+',projectsCount:'5+',techCount:'10+',isAvailable:true,typingWords:'.NET Backend Developer,React Frontend Developer,Full Stack Engineer',avatarUrl:''}
      setInfo(infoData)
      if (infoData.avatarUrl) setAvatarPreview(`http://localhost:5268${infoData.avatarUrl}`)
    } catch { logoutAdmin(); navigate('/login') }
  }

  // AVATAR UPLOAD
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
    setAvatarUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await uploadAvatar(formData)
      setInfo(prev => ({...prev, avatarUrl: res.data.url}))
      showMsg('Avatar uploaded successfully!')
    } catch { showMsg('Failed to upload avatar', 'error') }
    finally { setAvatarUploading(false) }
  }

  const handleRemoveAvatar = () => {
    setAvatarPreview(null)
    setInfo(prev => ({...prev, avatarUrl: ''}))
  }

  // CONTACTS
  const handleMarkRead = async (id) => {
    await markAsRead(id)
    setContacts(contacts.map(c => c.id === id ? {...c, isRead:true} : c))
  }
  const handleDeleteContact = async (id) => {
    if (!window.confirm('Delete this message?')) return
    await deleteContact(id)
    setContacts(contacts.filter(c => c.id !== id))
    showMsg('Message deleted')
  }

  // PROJECTS
  const handleSaveProject = async () => {
    try {
      if (editingProj) {
        const res = await updateProject(editingProj, projForm)
        setProjects(projects.map(p => p.id === editingProj ? res.data : p))
        showMsg('Project updated!')
      } else {
        const res = await createProject(projForm)
        setProjects([...projects, res.data])
        showMsg('Project added!')
      }
      setProjForm(emptyProject); setEditingProj(null); setShowProjForm(false)
    } catch { showMsg('Error saving project', 'error') }
  }
  const handleEditProject = (p) => { setProjForm({...p}); setEditingProj(p.id); setShowProjForm(true) }
  const handleDeleteProject = async (id) => {
    if (!window.confirm('Delete this project?')) return
    await deleteProject(id)
    setProjects(projects.filter(p => p.id !== id))
    showMsg('Project deleted')
  }

  // SKILLS
  const handleSaveSkill = async () => {
    try {
      if (editingSkill) {
        const res = await updateSkill(editingSkill, skillForm)
        setSkills(skills.map(s => s.id === editingSkill ? res.data : s))
        showMsg('Skill updated!')
      } else {
        const res = await createSkill(skillForm)
        setSkills([...skills, res.data])
        showMsg('Skill added!')
      }
      setSkillForm(emptySkill); setEditingSkill(null); setShowSkillForm(false)
    } catch { showMsg('Error saving skill', 'error') }
  }
  const handleEditSkill = (sk) => { setSkillForm({...sk}); setEditingSkill(sk.id); setShowSkillForm(true) }
  const handleDeleteSkill = async (id) => {
    if (!window.confirm('Delete this skill?')) return
    await deleteSkill(id)
    setSkills(skills.filter(s => s.id !== id))
    showMsg('Skill deleted')
  }

  // INFO
  const handleSaveInfo = async () => {
    try {
      await updatePortfolioInfo(info)
      showMsg('Info updated successfully!')
    } catch { showMsg('Error updating info', 'error') }
  }

  const filteredContacts = contacts.filter(c => {
    if (contactFilter === 'unread') return !c.isRead
    if (contactFilter === 'read') return c.isRead
    return true
  })
  const unread = contacts.filter(c => !c.isRead).length

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <div style={s.logo}>AD<span style={{color:'#64748b'}}>.</span> Admin</div>
        <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
          <span style={{fontFamily:'monospace',fontSize:'0.75rem',color:'#64748b'}}>{admin?.username}</span>
          <button onClick={()=>{logoutAdmin();navigate('/login')}} style={{border:'1px solid #1a2744',background:'transparent',color:'#64748b',padding:'0.4rem 1rem',borderRadius:'6px',cursor:'pointer',fontSize:'0.78rem',fontFamily:'monospace'}}>Logout</button>
        </div>
      </nav>

      <div style={s.tabBar}>
        {[['dashboard','📊 Dashboard'],['contacts',`✉️ Messages${unread>0?` (${unread})`:''}` ],['projects','🚀 Projects'],['skills','⚡ Skills'],['info','👤 My Info']].map(([key,label]) => (
          <button key={key} style={s.tab(tab===key)} onClick={()=>setTab(key)}>{label}</button>
        ))}
      </div>

      <div style={s.container}>
        {msg && <div style={s.msg(msg.type)}>{msg.type==='success'?'✓':' ✗'} {msg.text}</div>}

        {/* DASHBOARD */}
        {tab==='dashboard' && (
          <div>
            <div style={s.sectionTitle}><span style={{width:'16px',height:'1px',background:'#00d4ff'}}></span>Overview</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:'1rem',marginBottom:'2rem'}}>
              {[[contacts.length,'Messages','#00d4ff'],[unread,'Unread','#f59e0b'],[projects.length,'Projects','#7c3aed'],[skills.length,'Skills','#10b981']].map(([n,l,c])=>(
                <div key={l} style={s.statCard}>
                  <div style={{...s.statNum,background:`linear-gradient(135deg,${c},${c}99)`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>{n}</div>
                  <div style={s.statLabel}>{l}</div>
                </div>
              ))}
            </div>
            <div style={s.card}>
              <div style={s.sectionTitle}><span style={{width:'16px',height:'1px',background:'#00d4ff'}}></span>Latest Messages</div>
              {contacts.slice(0,3).map(c=>(
                <div key={c.id} style={{padding:'0.75rem 0',borderBottom:'1px solid #1a2744',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <span style={{fontWeight:600,fontSize:'0.88rem'}}>{c.name}</span>
                    <span style={{color:'#64748b',fontSize:'0.78rem',marginLeft:'0.5rem'}}>{c.email}</span>
                  </div>
                  <span style={s.badge(c.isRead)}>{c.isRead?'Read':'New'}</span>
                </div>
              ))}
              {contacts.length===0 && <div style={{color:'#64748b',fontSize:'0.85rem',textAlign:'center',padding:'1rem'}}>No messages yet</div>}
            </div>
          </div>
        )}

        {/* CONTACTS */}
        {tab==='contacts' && (
          <div>
            <div style={{display:'flex',gap:'0.5rem',marginBottom:'1rem',flexWrap:'wrap'}}>
              {['all','unread','read'].map(f=>(
                <button key={f} style={s.tab(contactFilter===f)} onClick={()=>setContactFilter(f)}>{f.toUpperCase()}</button>
              ))}
            </div>
            {filteredContacts.length===0 && <div style={{...s.card,color:'#64748b',textAlign:'center'}}>No messages found</div>}
            {filteredContacts.map(c=>(
              <div key={c.id} style={{...s.card,borderColor:!c.isRead?'rgba(0,212,255,0.3)':'#1a2744'}}>
                <div style={{...s.row,marginBottom:'0.75rem'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
                    <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'#0f1624',border:'1px solid #1a2744',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,color:'#00d4ff',fontSize:'0.9rem',flexShrink:0}}>{c.name[0]?.toUpperCase()}</div>
                    <div>
                      <div style={{fontWeight:600}}>{c.name}</div>
                      <div style={{color:'#64748b',fontSize:'0.78rem'}}>{c.email}</div>
                    </div>
                    {!c.isRead && <span style={s.badge(false)}>NEW</span>}
                  </div>
                  <div style={{color:'#64748b',fontSize:'0.72rem',fontFamily:'monospace'}}>{new Date(c.createdAt).toLocaleDateString()}</div>
                </div>
                <div style={{fontSize:'0.82rem',color:'#64748b',marginBottom:'0.35rem'}}><strong style={{color:'#94a3b8'}}>Phone:</strong> {c.phone}</div>
                <div style={{fontSize:'0.82rem',color:'#64748b',marginBottom:'0.75rem'}}><strong style={{color:'#94a3b8'}}>Subject:</strong> {c.subject}</div>
                <div style={{background:'#0f1624',borderRadius:'6px',padding:'0.75rem',fontSize:'0.83rem',color:'#94a3b8',lineHeight:1.6,marginBottom:'0.75rem'}}>{c.message}</div>
                <div style={{display:'flex',gap:'0.5rem'}}>
                  {!c.isRead && <button style={s.btnSuccess} onClick={()=>handleMarkRead(c.id)}>✓ Mark as Read</button>}
                  <button style={s.btnDanger} onClick={()=>handleDeleteContact(c.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PROJECTS */}
        {tab==='projects' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
              <div style={s.sectionTitle}><span style={{width:'16px',height:'1px',background:'#00d4ff'}}></span>Projects ({projects.length})</div>
              <button style={s.btnPrimary} onClick={()=>{setProjForm(emptyProject);setEditingProj(null);setShowProjForm(!showProjForm)}}>{showProjForm?'Cancel':'+ Add Project'}</button>
            </div>
            {showProjForm && (
              <div style={{...s.card,borderColor:'rgba(0,212,255,0.3)',marginBottom:'1.5rem'}}>
                <div style={s.sectionTitle}><span style={{width:'16px',height:'1px',background:'#00d4ff'}}></span>{editingProj?'Edit Project':'New Project'}</div>
                <div style={s.grid2}>
                  <div><label style={s.label}>Title *</label><input style={s.input()} value={projForm.title} onChange={e=>setProjForm({...projForm,title:e.target.value})} placeholder="Project title"/></div>
                  <div><label style={s.label}>Icon (emoji)</label><input style={s.input()} value={projForm.icon} onChange={e=>setProjForm({...projForm,icon:e.target.value})} placeholder="🚀"/></div>
                </div>
                <label style={s.label}>Description *</label>
                <textarea style={{...s.input(),minHeight:'80px',resize:'vertical'}} value={projForm.description} onChange={e=>setProjForm({...projForm,description:e.target.value})} placeholder="Project description"/>
                <label style={s.label}>Tags (comma separated)</label>
                <input style={s.input()} value={projForm.tags} onChange={e=>setProjForm({...projForm,tags:e.target.value})} placeholder=".NET Core, React, SQL Server"/>
                <div style={s.grid2}>
                  <div><label style={s.label}>GitHub URL</label><input style={s.input()} value={projForm.gitHubUrl} onChange={e=>setProjForm({...projForm,gitHubUrl:e.target.value})} placeholder="https://github.com/..."/></div>
                  <div><label style={s.label}>Live URL</label><input style={s.input()} value={projForm.liveUrl} onChange={e=>setProjForm({...projForm,liveUrl:e.target.value})} placeholder="https://..."/></div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'1rem'}}>
                  <button style={s.toggle(projForm.isFeatured)} onClick={()=>setProjForm({...projForm,isFeatured:!projForm.isFeatured})}>
                    <div style={{width:'16px',height:'16px',borderRadius:'50%',background:'#fff',position:'absolute',top:'3px',transition:'left .3s',left:projForm.isFeatured?'25px':'3px'}}></div>
                  </button>
                  <label style={{...s.label,margin:0}}>Featured Project</label>
                </div>
                <div style={{display:'flex',gap:'0.75rem'}}>
                  <button style={s.btnPrimary} onClick={handleSaveProject}>{editingProj?'Update':'Add'} Project</button>
                  <button style={s.btnDanger} onClick={()=>{setShowProjForm(false);setEditingProj(null);setProjForm(emptyProject)}}>Cancel</button>
                </div>
              </div>
            )}
            {projects.length===0 && !showProjForm && <div style={{...s.card,color:'#64748b',textAlign:'center'}}>No projects yet.</div>}
            {projects.map(p=>(
              <div key={p.id} style={s.card}>
                <div style={s.row}>
                  <div style={{display:'flex',alignItems:'center',gap:'0.75rem',flex:1}}>
                    <span style={{fontSize:'1.5rem'}}>{p.icon}</span>
                    <div>
                      <div style={{fontWeight:700,fontSize:'0.95rem'}}>{p.title}</div>
                      <div style={{color:'#64748b',fontSize:'0.78rem',marginTop:'2px'}}>{p.description}</div>
                      <div style={{display:'flex',flexWrap:'wrap',gap:'0.3rem',marginTop:'0.5rem'}}>
                        {p.tags?.split(',').map(t=>t.trim()).filter(Boolean).map(t=>(
                          <span key={t} style={{fontFamily:'monospace',fontSize:'0.6rem',padding:'2px 6px',background:'rgba(0,212,255,0.06)',border:'1px solid rgba(0,212,255,0.18)',color:'#00d4ff',borderRadius:'2px'}}>{t}</span>
                        ))}
                        {p.isFeatured && <span style={{fontFamily:'monospace',fontSize:'0.6rem',padding:'2px 6px',background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.3)',color:'#f59e0b',borderRadius:'2px'}}>Featured</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:'0.5rem',flexShrink:0}}>
                    <button style={s.btnEdit} onClick={()=>handleEditProject(p)}>Edit</button>
                    <button style={s.btnDanger} onClick={()=>handleDeleteProject(p.id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SKILLS */}
        {tab==='skills' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
              <div style={s.sectionTitle}><span style={{width:'16px',height:'1px',background:'#00d4ff'}}></span>Skills ({skills.length})</div>
              <button style={s.btnPrimary} onClick={()=>{setSkillForm(emptySkill);setEditingSkill(null);setShowSkillForm(!showSkillForm)}}>{showSkillForm?'Cancel':'+ Add Skill'}</button>
            </div>
            {showSkillForm && (
              <div style={{...s.card,borderColor:'rgba(0,212,255,0.3)',marginBottom:'1.5rem'}}>
                <div style={s.sectionTitle}><span style={{width:'16px',height:'1px',background:'#00d4ff'}}></span>{editingSkill?'Edit Skill':'New Skill'}</div>
                <div style={s.grid2}>
                  <div><label style={s.label}>Skill Name *</label><input style={s.input()} value={skillForm.name} onChange={e=>setSkillForm({...skillForm,name:e.target.value})} placeholder="e.g. React.js"/></div>
                  <div>
                    <label style={s.label}>Category</label>
                    <select style={{...s.input(),cursor:'pointer'}} value={skillForm.category} onChange={e=>setSkillForm({...skillForm,category:e.target.value})}>
                      <option>Backend</option><option>Frontend</option><option>Tools & DB</option>
                    </select>
                  </div>
                </div>
                <div style={s.grid2}>
                  <div><label style={s.label}>Color</label><input style={s.input()} value={skillForm.color} onChange={e=>setSkillForm({...skillForm,color:e.target.value})} placeholder="#00d4ff"/></div>
                  <div><label style={s.label}>Order</label><input style={s.input()} type="number" value={skillForm.order} onChange={e=>setSkillForm({...skillForm,order:+e.target.value})} placeholder="0"/></div>
                </div>
                <div style={{display:'flex',gap:'0.75rem'}}>
                  <button style={s.btnPrimary} onClick={handleSaveSkill}>{editingSkill?'Update':'Add'} Skill</button>
                  <button style={s.btnDanger} onClick={()=>{setShowSkillForm(false);setEditingSkill(null);setSkillForm(emptySkill)}}>Cancel</button>
                </div>
              </div>
            )}
            {['Backend','Frontend','Tools & DB'].map(cat=>{
              const catSkills = skills.filter(s=>s.category===cat)
              if(catSkills.length===0) return null
              return (
                <div key={cat} style={{marginBottom:'1.5rem'}}>
                  <div style={{fontFamily:'monospace',fontSize:'0.7rem',color:'#00d4ff',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'0.75rem'}}>{cat}</div>
                  {catSkills.map(sk=>(
                    <div key={sk.id} style={{...s.card,display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.5rem'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
                        <div style={{width:'8px',height:'8px',borderRadius:'50%',background:sk.color,flexShrink:0}}></div>
                        <span style={{fontSize:'0.88rem',fontWeight:500}}>{sk.name}</span>
                      </div>
                      <div style={{display:'flex',gap:'0.5rem'}}>
                        <button style={s.btnEdit} onClick={()=>handleEditSkill(sk)}>Edit</button>
                        <button style={s.btnDanger} onClick={()=>handleDeleteSkill(sk.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
            {skills.length===0 && !showSkillForm && <div style={{...s.card,color:'#64748b',textAlign:'center'}}>No skills yet.</div>}
          </div>
        )}

        {/* INFO */}
        {tab==='info' && info && (
          <div>
            <div style={s.sectionTitle}><span style={{width:'16px',height:'1px',background:'#00d4ff'}}></span>Personal Info</div>
            <div style={s.card}>

              {/* AVATAR */}
              <div style={s.sectionTitle}><span style={{width:'16px',height:'1px',background:'#00d4ff'}}></span>Profile Photo</div>
              <div style={{display:'flex',alignItems:'center',gap:'1.5rem',marginBottom:'1.5rem'}}>
                <div style={{width:'80px',height:'80px',borderRadius:'50%',overflow:'hidden',border:'2px solid rgba(0,212,255,0.3)',background:'#0f1624',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  {avatarPreview ? <img src={avatarPreview} alt="avatar" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center 8%'}}/> : <span style={{color:'#64748b',fontSize:'1.5rem'}}>👤</span>}
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
                  <label style={{...s.btnPrimary,display:'inline-block',cursor:'pointer',textAlign:'center'}}>
                    {avatarUploading ? 'Uploading...' : '📷 Upload Photo'}
                    <input type="file" accept="image/*" style={{display:'none'}} onChange={handleAvatarChange} disabled={avatarUploading}/>
                  </label>
                  {avatarPreview && <button style={s.btnDanger} onClick={handleRemoveAvatar}>Remove Photo</button>}
                  <span style={{fontFamily:'monospace',fontSize:'0.6rem',color:'#64748b'}}>JPG, PNG, WebP accepted</span>
                </div>
              </div>

              <hr style={s.divider}/>

              {/* TYPING WORDS */}
              <div style={s.sectionTitle}><span style={{width:'16px',height:'1px',background:'#00d4ff'}}></span>Typing Effect Words</div>
              <label style={s.label}>Words (comma separated — بيتكتبوا واحدة واحدة في الموقع)</label>
              <textarea style={{...s.input(),minHeight:'70px',resize:'vertical',marginBottom:'1.5rem'}}
                value={info.typingWords||''} onChange={e=>setInfo({...info,typingWords:e.target.value})}
                placeholder=".NET Backend Developer,React Frontend Developer,Full Stack Engineer"/>
              <div style={{fontFamily:'monospace',fontSize:'0.65rem',color:'#64748b',marginBottom:'1rem'}}>
                Preview: {info.typingWords?.split(',')[0] || '...'}
              </div>

              <hr style={s.divider}/>

              {/* BASIC INFO */}
              <div style={s.sectionTitle}><span style={{width:'16px',height:'1px',background:'#00d4ff'}}></span>Basic Info</div>
              <div style={s.grid2}>
                <div><label style={s.label}>Full Name</label><input style={s.input()} value={info.fullName||''} onChange={e=>setInfo({...info,fullName:e.target.value})}/></div>
                <div><label style={s.label}>Title / Role</label><input style={s.input()} value={info.title||''} onChange={e=>setInfo({...info,title:e.target.value})}/></div>
              </div>
              <label style={s.label}>Bio</label>
              <textarea style={{...s.input(),minHeight:'80px',resize:'vertical'}} value={info.bio||''} onChange={e=>setInfo({...info,bio:e.target.value})} placeholder="Tell visitors about yourself..."/>
              <div style={s.grid2}>
                <div><label style={s.label}>Location</label><input style={s.input()} value={info.location||''} onChange={e=>setInfo({...info,location:e.target.value})} placeholder="Giza, Egypt"/></div>
                <div><label style={s.label}>Email</label><input style={s.input()} value={info.email||''} onChange={e=>setInfo({...info,email:e.target.value})} placeholder="ahmed@gmail.com"/></div>
              </div>
              <div style={s.grid2}>
                <div><label style={s.label}>LinkedIn URL</label><input style={s.input()} value={info.linkedIn||''} onChange={e=>setInfo({...info,linkedIn:e.target.value})} placeholder="linkedin.com/in/..."/></div>
                <div><label style={s.label}>GitHub URL</label><input style={s.input()} value={info.gitHub||''} onChange={e=>setInfo({...info,gitHub:e.target.value})} placeholder="github.com/..."/></div>
              </div>

              <hr style={s.divider}/>
              <div style={s.sectionTitle}><span style={{width:'16px',height:'1px',background:'#00d4ff'}}></span>Stats</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'1rem'}}>
                <div><label style={s.label}>Years Experience</label><input style={s.input()} value={info.yearsExperience||''} onChange={e=>setInfo({...info,yearsExperience:e.target.value})} placeholder="2+"/></div>
                <div><label style={s.label}>Projects Count</label><input style={s.input()} value={info.projectsCount||''} onChange={e=>setInfo({...info,projectsCount:e.target.value})} placeholder="5+"/></div>
                <div><label style={s.label}>Technologies</label><input style={s.input()} value={info.techCount||''} onChange={e=>setInfo({...info,techCount:e.target.value})} placeholder="10+"/></div>
              </div>

              <hr style={s.divider}/>
              <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'1.5rem'}}>
                <button style={s.toggle(info.isAvailable)} onClick={()=>setInfo({...info,isAvailable:!info.isAvailable})}>
                  <div style={{width:'16px',height:'16px',borderRadius:'50%',background:'#fff',position:'absolute',top:'3px',transition:'left .3s',left:info.isAvailable?'25px':'3px'}}></div>
                </button>
                <label style={{...s.label,margin:0}}>Available for opportunities</label>
                <span style={{fontSize:'0.75rem',color:info.isAvailable?'#10b981':'#64748b'}}>{info.isAvailable?'● Open to Work':'○ Not Available'}</span>
              </div>

              <button style={s.btnPrimary} onClick={handleSaveInfo}>💾 Save All Changes</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
