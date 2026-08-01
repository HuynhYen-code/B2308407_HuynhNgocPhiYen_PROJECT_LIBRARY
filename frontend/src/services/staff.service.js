import api from './api'

export const staffService = {
  getAll: (params) => api.get('/staff', { params }),
  getById: (id) => api.get(`/staff/${id}`),
  create: (data) => api.post('/staff', data),
  update: (id, data) => api.put(`/staff/${id}`, data),
  resetCredentials: (id, data) => api.patch(`/staff/${id}/credentials`, data),
  remove: (id) => api.delete(`/staff/${id}`)
}
