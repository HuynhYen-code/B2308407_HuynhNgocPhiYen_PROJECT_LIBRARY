import api from './api'

export const borrowService = {
  // Staff/Admin
  getAll: (params) => api.get('/borrows', { params }),
  // approve now requires assignments: [{ chiTietId, cuonSachId }]
  approve: (id, data) => api.patch(`/borrows/${id}/approve`, data),
  reject: (id, data) => api.patch(`/borrows/${id}/reject`, data),
  returnBook: (borrowId, detailId, data) => api.patch(`/borrows/${borrowId}/details/${detailId}/return`, data),

  // Reader
  getMy: (params) => api.get('/borrows/my', { params }),
  // create now requires dauSachIds (not cuonSachIds)
  create: (data) => api.post('/borrows', data),
  cancel: (id) => api.patch(`/borrows/${id}/cancel`),
  renew: (id, detailId) => api.patch(`/borrows/${id}/details/${detailId}/renew`),

  // Common
  getById: (id) => api.get(`/borrows/${id}`),

  // Book copies available for a given DauSach (for staff assign)
  getAvailableCopies: (dauSachId) => api.get('/book-copies', { params: { dauSachId, trangThai: 'SanSang' } }),
}
