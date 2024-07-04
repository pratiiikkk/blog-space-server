import {Router} from 'express';
import { updateProfile,GetUser, SearchUser, SignIn, SignUp,changePassword, changeProfileImg,newNotification,notificationCount,notifications } from '../controllers/user.controller.js';
import verifyUser from '../middleware/verify.middleware.js';

const router = Router();

router.route('/signup').post(SignUp);
router.route('/signin').post(SignIn);
router.route('/search-user').post(SearchUser);
router.route('/get-user').post(GetUser);
router.route('/change-password').post(verifyUser,changePassword);
router.route('/change-profile-img').post(verifyUser,changeProfileImg);
router.route('/update-profile').post(verifyUser,updateProfile);
router.route('/new-notification').get(verifyUser,newNotification);
router.route('/notification-count').post(verifyUser,notificationCount); 
router.route('/notifications').post(verifyUser,notifications);

export default router;