import { Schema, model } from 'mongoose';

const roomSchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 50 },
  description: { type: String, maxlength: 200, default: '' },
  emoji: { type: String, default: '#' },
  creator: { type: Schema.Types.ObjectId, ref: 'Chatting-User' },
  isDefault: { type: Boolean, default: false },
  blockedUsers: [{ type: Schema.Types.ObjectId, ref: 'Chatting-User' }],
}, { timestamps: true });

export default model('Room', roomSchema);
