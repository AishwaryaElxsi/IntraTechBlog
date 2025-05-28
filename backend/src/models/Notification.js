import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },     // Who performed the action
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Who receives the notification
  type: { type: String, required: true },      // e.g., 'follow'
  message: { type: String },                   // Optional user-visible message
  unread: { type: Boolean, default: true },    // Read/unread status
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Notification', NotificationSchema);
