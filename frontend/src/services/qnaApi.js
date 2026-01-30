import api from './apiClient';

export const qnaApi = {
  // ============ Questions ============

  // Search/list questions
  searchQuestions: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.set('q', params.q);
    if (params.tag) searchParams.set('tag', params.tag);
    if (params.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params.page) searchParams.set('page', params.page);
    if (params.limit) searchParams.set('limit', params.limit);

    const queryString = searchParams.toString();
    return api.get(`/api/qna/questions${queryString ? `?${queryString}` : ''}`);
  },

  // Get single question
  getQuestion: (id) => api.get(`/api/qna/questions/${id}`),

  // Create question
  createQuestion: (data) => api.post('/api/qna/questions', data),

  // Update question
  updateQuestion: (id, data) => api.patch(`/api/qna/questions/${id}`, data),

  // Delete question
  deleteQuestion: (id) => api.delete(`/api/qna/questions/${id}`),

  // Close question
  closeQuestion: (id, reason) => api.post(`/api/qna/questions/${id}/close`, { reason }),

  // Vote on question
  voteQuestion: (id, value) => api.post(`/api/qna/questions/${id}/vote`, { value }),

  // Unaccept answer for question
  unacceptAnswer: (questionId) =>
    api.delete(`/api/qna/questions/${questionId}/accepted-answer`),

  // ============ Answers ============

  // Get answers for question
  getAnswers: (questionId, sortBy = 'votes') =>
    api.get(`/api/qna/questions/${questionId}/answers?sortBy=${sortBy}`),

  // Create answer
  createAnswer: (questionId, body) =>
    api.post(`/api/qna/questions/${questionId}/answers`, { body }),

  // Update answer
  updateAnswer: (id, body) => api.patch(`/api/qna/answers/${id}`, { body }),

  // Delete answer
  deleteAnswer: (id) => api.delete(`/api/qna/answers/${id}`),

  // Vote on answer
  voteAnswer: (id, value) => api.post(`/api/qna/answers/${id}/vote`, { value }),

  // Accept answer
  acceptAnswer: (id) => api.post(`/api/qna/answers/${id}/accept`),

  // ============ Tags ============

  // Get popular tags
  getTags: (limit = 20) => api.get(`/api/qna/tags?limit=${limit}`),

  // ============ Reports ============

  // Create a report
  createReport: (data) => api.post('/api/reports', data),
};

export const moderationApi = {
  // Get pending reports
  getPendingReports: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page);
    if (params.limit) searchParams.set('limit', params.limit);
    if (params.targetType) searchParams.set('targetType', params.targetType);

    const queryString = searchParams.toString();
    return api.get(`/api/reports/pending${queryString ? `?${queryString}` : ''}`);
  },

  // Get report counts
  getReportCounts: () => api.get('/api/reports/counts'),

  // Get report history
  getReportHistory: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page);
    if (params.limit) searchParams.set('limit', params.limit);
    if (params.status) searchParams.set('status', params.status);

    const queryString = searchParams.toString();
    return api.get(`/api/reports/history${queryString ? `?${queryString}` : ''}`);
  },

  // Get single report
  getReport: (id) => api.get(`/api/reports/${id}`),

  // Resolve report
  resolveReport: (id, resolution, notes) =>
    api.post(`/api/reports/${id}/resolve`, { resolution, notes }),

  // Dismiss report
  dismissReport: (id, notes) => api.post(`/api/reports/${id}/dismiss`, { notes }),
};
