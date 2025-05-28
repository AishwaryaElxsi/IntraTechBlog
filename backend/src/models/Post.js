import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  tags: [{ type: String }],
  featuredImage: { type: String },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reactions: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  published: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Post', PostSchema);
