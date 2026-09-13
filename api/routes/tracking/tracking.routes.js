import express from 'express';
import { trackOrder, getWorkStatuses } from '../../controllers/tracking/tracking.controller.js';

const router = express.Router();

router.get('/work-statuses', getWorkStatuses);
router.get('/:orderNo', trackOrder);

export default router;
