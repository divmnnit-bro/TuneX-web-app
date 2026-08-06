import api from './axios'
export const toggleVideoLike = (videoId) => api.patch(`/likes/toggle-like/${videoId}`)