import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
})

// Auto-retry on 429 (rate limit) with backoff
api.interceptors.response.use(null, async (error) => {
  if (error.response?.status === 429) {
    await new Promise(r => setTimeout(r, 2000))
    return api.request(error.config)
  }
  return Promise.reject(error)
})

export const uploadFiles = (files, project) => {
  const form = new FormData()
  files.forEach(f => form.append('files', f))
  form.append('project', project)
  return api.post('/upload', form, {headers: {'Content-Type': 'multipart/form-data'}})
}

export const extractItems = (meetingId) => api.post(`/meetings/${meetingId}/extract`)
export const askQuestion = (question, meetingId, history) =>
  api.post('/chat', { question, meeting_id: meetingId, history })
export const getSentiment = (meetingId) => api.get(`/meetings/${meetingId}/sentiment`)
export const getMeetings = () => api.get('/meetings')
export const exportItems = (meetingId, format) =>
  api.get(`/meetings/${meetingId}/export?format=${format}`, { responseType: 'blob' })