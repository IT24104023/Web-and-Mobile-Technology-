import api from './api';

const wrap = (res) => ({ success: true, data: res.data.data, message: res.data.message || '' });

export async function submitFeedback(payload) {
  try {
    const res = await api.post('/feedback', payload);
    return wrap(res);
  } catch (err) {
    return { success: false, data: null, message: err.response?.data?.message || err.message };
  }
}

export async function getMyFeedbacks() {
  try {
    const res = await api.get('/feedback/my');
    return wrap(res);
  } catch (err) {
    return { success: false, data: null, message: err.response?.data?.message || err.message };
  }
}

export async function getClinicReviews() {
  try {
    const res = await api.get('/feedback/clinic-reviews');
    return wrap(res);
  } catch (err) {
    return { success: false, data: null, message: err.response?.data?.message || err.message };
  }
}

export async function editFeedback(id, payload) {
  try {
    const res = await api.put(`/feedback/${id}`, payload);
    return wrap(res);
  } catch (err) {
    return { success: false, data: null, message: err.response?.data?.message || err.message };
  }
}

export async function deleteFeedback(id) {
  try {
    const res = await api.delete(`/feedback/${id}`);
    return wrap(res);
  } catch (err) {
    return { success: false, data: null, message: err.response?.data?.message || err.message };
  }
}
