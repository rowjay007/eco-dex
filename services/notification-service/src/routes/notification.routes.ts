import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';

const router = Router();

router.post('/send', notificationController.send);
router.post('/send-bulk', notificationController.sendBulk);
router.post('/subscribe', notificationController.subscribe);

export const notificationRoutes = router;