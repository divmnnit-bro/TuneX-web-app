import api from './axios';
export const registerUser = (formData) => 
    api.post('/users/register',formData,{ headers: { 'Content-Type': 'multipart/form-data' } });
export const loginUser = (credentials) => api.post('/users/login', credentials);

export const logoutUser = () => api.post('/users/logOut');
export const getCurrentUser = () => api.get('/users/get-User');
export const updatePassword = ( oldPassword,newPassword ) => 
    api.patch('/users/update-password', { oldPassword, newPassword});
export const updateAccountDetails = (fullname, email) =>
  api.patch('/users/update-account-details', { fullname, email });
export const updateAvatar = (formData) =>
  api.patch('/users/update-avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateCoverImage = (formData) =>
  api.patch('/users/update-cover-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getChannelProfile = (userName) => api.get(`/users/c/${userName}`);
export const getWatchHistory = () => api.get('/users/watch-history');