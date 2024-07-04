import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiResponse from '../utils/ApiResponse.js';
const verifyUser = (req, res, next) => {
  try {
    const { authorization } = req.headers;
      if (!authorization) {
         return ApiResponse(res, 401, 'Unauthorized');
      }

      const token = authorization.replace('Bearer ', '');

        jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
            if (err) {
                return ApiResponse(res, 401, 'Unauthorized');
            }

            const { id } = payload
            User.findById(id).then
            (userdata => {
                req.user = userdata
                next()
            })

        })
    
  } catch (error) {
    console.error('Error occurred while verifying user: ', error.message);
    return ApiResponse(res, 500, 'Error occurred while verifying user');
  }

}

export default verifyUser;