import express from 'express';
import * as controller from '../controllers/feedbackController.js';
import validateFeedback from '../middleware/validateFeedback.js';

const router = express.Router();

// NOTE: All routes expect `req.user` to be set by authentication middleware.

router.post('/', validateFeedback, controller.submitFeedback);
router.get('/my', controller.getMyFeedbacks);
router.get('/clinic-reviews', controller.getClinicReviews);
router.put('/:id', validateFeedback, controller.editFeedback);
router.delete('/:id', controller.deleteFeedback);
router.post('/:id/doctor-reply', controller.doctorReply);
router.post('/:id/admin-reply', controller.adminReply);

export default router;
