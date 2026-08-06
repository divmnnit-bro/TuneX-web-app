import api from './axios'

export const createPlaylist = (name) => api.post('/playlist/create-playlist', { name })
export const getPlaylistById = (playlistId) => api.get(`/playlist/${playlistId}`)
export const updatePlaylist = (playlistId, name) => api.patch(`/playlist/${playlistId}`, { name })
export const deletePlaylist = (playlistId) => api.delete(`/playlist/${playlistId}`)
export const getUserPlaylists = () => api.get('/playlist/getUserPlaylists')
export const addVideoToPlaylist = (playlistId, videoId) => api.patch(`/playlist/add/${playlistId}/${videoId}`)
export const removeVideoFromPlaylist = (playlistId, videoId) => api.patch(`/playlist/remove/${playlistId}/${videoId}`)