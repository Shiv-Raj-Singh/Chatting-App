import Room from '../model/room.js';
import Message from '../model/message.js';
import catchAsync from './catchAsync.js';
import AppError from '../middleware/AppError.js';

export const getRooms = catchAsync(async (req, res) => {
  const rooms = await Room.find().sort({ isDefault: -1, createdAt: 1 });
  res.status(200).json({ status: true, data: rooms });
});

export const createRoom = catchAsync(async (req, res, next) => {
  const { name, description, emoji } = req.body;
  if (!name?.trim()) return next(new AppError('Room name is required', 400));

  const existing = await Room.findOne({ name: name.trim().toLowerCase() });
  if (existing) return next(new AppError('A room with this name already exists', 409));

  const room = await Room.create({
    name: name.trim().toLowerCase(),
    description: description?.trim() || '',
    emoji: emoji || '#',
    creator: req.user.userId,
  });

  res.status(201).json({ status: true, data: room, message: 'Room created successfully' });
});

export const getRoomMessages = catchAsync(async (req, res) => {
  const { roomId } = req.params;
  const { limit = 50, before } = req.query;

  const query = { room: roomId };
  if (before) query._id = { $lt: before };

  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(limit), 100))
    .populate('sender', 'name avatarColor')
    .lean();

  res.status(200).json({ status: true, data: messages.reverse() });
});
