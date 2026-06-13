import Room from '../model/room.js';
import Message from '../model/message.js';
import catchAsync from './catchAsync.js';
import AppError from '../middleware/AppError.js';

export const getRooms = catchAsync(async (req, res) => {
  const rooms = await Room.find()
    .sort({ isDefault: -1, createdAt: 1 })
    .populate('creator', 'name _id');
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

  await room.populate('creator', 'name _id');

  res.status(201).json({ status: true, data: room, message: 'Room created successfully' });
});

export const deleteRoom = catchAsync(async (req, res, next) => {
  const { roomId } = req.params;

  const room = await Room.findById(roomId);
  if (!room) return next(new AppError('Room not found', 404));
  if (room.isDefault) return next(new AppError('Default rooms cannot be deleted', 403));
  if (room.creator?.toString() !== req.user.userId.toString())
    return next(new AppError('Only the room creator can delete it', 403));

  await Message.deleteMany({ room: roomId });
  await Room.findByIdAndDelete(roomId);

  res.status(200).json({ status: true, message: 'Room deleted' });
});

export const blockUser = catchAsync(async (req, res, next) => {
  const { roomId } = req.params;
  const { userId, unblock } = req.body;

  if (!userId) return next(new AppError('userId is required', 400));

  const room = await Room.findById(roomId);
  if (!room) return next(new AppError('Room not found', 404));
  if (room.creator?.toString() !== req.user.userId.toString())
    return next(new AppError('Only the room creator can manage users', 403));

  if (unblock) {
    room.blockedUsers = room.blockedUsers.filter((id) => id.toString() !== userId);
  } else {
    if (!room.blockedUsers.map((id) => id.toString()).includes(userId)) {
      room.blockedUsers.push(userId);
    }
  }

  await room.save();
  res.status(200).json({ status: true, message: unblock ? 'User unblocked' : 'User removed from room' });
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
