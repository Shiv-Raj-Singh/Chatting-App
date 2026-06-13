import { verifyJwtToken } from '../utility.js';
import AppError from './AppError.js';

const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return next(new AppError('Authentication required', 401));
  const decoded = verifyJwtToken(token);
  if (!decoded) return next(new AppError('Invalid or expired token', 401));
  req.user = decoded;
  next();
};

export default protect;
