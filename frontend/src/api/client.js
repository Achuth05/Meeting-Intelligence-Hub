import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => Promise.reject(error))

api.interceptors.response.use(null, async (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    window.location.href = '/auth'
    return
  }
  if (error.response?.status === 429) {
    await new Promise(r => setTimeout(r, 2000))
    return api.request(error.config)
  }
  return Promise.reject(error)
})

// Auth
export const loginUser = (email, password) => api.post('/auth/login', { email, password })
export const registerUser = (email, password) => api.post('/auth/register', { email, password })
export const logoutUser = () => api.post('/auth/logout')

// Meetings
export const getMeetings = () => api.get('/meetings')
export const deleteMeeting = (meetingId) => api.delete(`/meetings/${meetingId}`)

// Upload
export const uploadFiles = (files, project) => {
  const form = new FormData()
  files.forEach(f => form.append('files', f))
  form.append('project', project)
  return api.post('/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
}

// Analysis
export const extractItems = (meetingId) => api.post(`/meetings/${meetingId}/extract`)
export const getSentiment = (meetingId) => api.get(`/meetings/${meetingId}/sentiment`)
export const exportItems = (meetingId, format) =>
  api.get(`/meetings/${meetingId}/export?format=${format}`, { responseType: 'blob' })

// Chat
export const askQuestion = (question, meetingId, history) =>
  api.post('/chat', { question, meeting_id: meetingId, history })