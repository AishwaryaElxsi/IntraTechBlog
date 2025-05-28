import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User schema supporting both SSO and local users.
 * For local users, `passwordHash` is stored and used for authentication.
 */
const UserSchema = new mongoose.Schema({
  ssoId: { type: String, unique: true, sparse: true }, // SSO users have ssoId, local users don't
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String }, // Only for local (non-SSO) users
  name: { type: String, required: true },
  avatar: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },

  // Followers/following as arrays of User ObjectIds
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

/**
 * Hash and set password for local users.
 * @param {string} password
 */
 // PUBLIC_INTERFACE
UserSchema.methods.setPassword = async function(password) {
  this.passwordHash = await bcrypt.hash(password, 12);
};

/**
 * Validate password for local users.
 * @param {string} password
 * @returns {Promise<boolean>}
 */
 // PUBLIC_INTERFACE
UserSchema.methods.validatePassword = async function(password) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};

export default mongoose.model('User', UserSchema);
