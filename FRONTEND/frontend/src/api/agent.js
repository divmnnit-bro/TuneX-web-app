import api from './axios'
export const chatWithAgent = (message, history = []) => api.post('/agent/chat', { message, history })