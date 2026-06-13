import { Schema, model } from 'mongoose';

const messageSchema = new Schema({
  room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'Chatting-User', required: true },
  content: { type: String, required: true, trim: true, maxlength: 2000 },
  type: { type: String, enum: ['text', 'system'], default: 'text' },
}, { timestamps: true });

messageSchema.index({ room: 1, createdAt: -1 });

export default model('Message', messageSchema);
