import api from './axios';

export const getAllVideos = (query = '') =>
  api.get('/videos', { params: query ? { query } : {} })
export const uploadVideo = (formData, onUploadProgress) => {
    return api.post('/videos/upload',formData,{
        headers:{ 'Content-Type' : 'multipart/form-data'},
        onUploadProgress
    })
};
export const getVideoById = (videoId) => api.get(`/videos/v/${videoId}`);
export const getMyVideos = () => api.get('/videos/my-videos')
export const updateVideoDetails = (videoId, formData) =>
  api.patch(`/videos/v/${videoId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteVideo = (videoId) => api.delete(`/videos/v/${videoId}`);
export const togglePublishStatus = (videoId) => api.patch(`/videos/toggle-publish-status/${videoId}`);
export const getChannelVideos = (username) => api.get(`/videos/channel/${username}`);
export const getSubscribedFeed = () => api.get('/videos/subscribed-channels-videos');