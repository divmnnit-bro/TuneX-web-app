import api from './axios'
export const toggleSubscription = (channelId) => api.patch(`/subscription/toggle-sub/${channelId}`)