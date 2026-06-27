import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:5268/api',
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Contact
export const sendContact = (data) => API.post('/contact', data)
export const getContacts = () => API.get('/contact')
export const markAsRead = (id) => API.put(`/contact/${id}/read`)
export const deleteContact = (id) => API.delete(`/contact/${id}`)

// Auth
export const login = (data) => API.post('/auth/login', data)

// Projects
export const getProjects = () => API.get('/projects')
export const createProject = (data) => API.post('/projects', data)
export const updateProject = (id, data) => API.put(`/projects/${id}`, data)
export const deleteProject = (id) => API.delete(`/projects/${id}`)

// Skills
export const getSkills = () => API.get('/skills')
export const createSkill = (data) => API.post('/skills', data)
export const updateSkill = (id, data) => API.put(`/skills/${id}`, data)
export const deleteSkill = (id) => API.delete(`/skills/${id}`)

// Portfolio Info
export const getPortfolioInfo = () => API.get('/portfolioinfo')
export const updatePortfolioInfo = (data) => API.put('/portfolioinfo', data)
// Upload Avatar
export const uploadAvatar = (formData) => API.post('/upload/avatar', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})