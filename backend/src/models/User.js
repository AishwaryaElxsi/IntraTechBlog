import bcrypt from 'bcryptjs';
import * as storage from '../storage.js';

/**
 * User object shape for the file database.
 */
export class User {
  constructor(data) {
    this.id = data.id || data._id || (Date.now().toString() + Math.random().toString(36).slice(2, 8));
    this._id = this.id;
    this.ssoId = data.ssoId;
    this.email = data.email;
    this.passwordHash = data.passwordHash || '';
    this.name = data.name;
    this.avatar = data.avatar || '';
    this.role = data.role || 'user';
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.followers = Array.isArray(data.followers) ? data.followers : [];
    this.following = Array.isArray(data.following) ? data.following : [];
  }

  // PUBLIC_INTERFACE
  /**
   * Hash and set password for local users.
   * @param {string} password
   */
  async setPassword(password) {
    this.passwordHash = await bcrypt.hash(password, 12);
  }

  // PUBLIC_INTERFACE
  /**
   * Validate password for local users.
   * @param {string} password
   * @returns {Promise<boolean>}
   */
  async validatePassword(password) {
    if (!this.passwordHash) return false;
    return bcrypt.compare(password, this.passwordHash);
  }

  // PUBLIC_INTERFACE
  /**
   * Convert to plain object (for inserting/updating in db)
   */
  toObject() {
    return {
      id: this.id,
      _id: this._id,
      ssoId: this.ssoId,
      email: this.email,
      passwordHash: this.passwordHash,
      name: this.name,
      avatar: this.avatar,
      role: this.role,
      createdAt: this.createdAt,
      followers: this.followers,
      following: this.following
    };
  }

  // PUBLIC_INTERFACE
  static async findOne(q) {
    const users = await storage.getAll('users');
    let user;
    if (q.email) {
      user = users.find(u => u.email === q.email);
    } else if (q.ssoId) {
      user = users.find(u => u.ssoId === q.ssoId);
    } else if (q.id) {
      user = users.find(u => u.id === q.id || u._id === q.id);
    }
    if (user && q.ssoId !== undefined && user.ssoId !== q.ssoId) {
      // strict ssoId match, e.g. for local login vs sso
      return null;
    }
    if (user && q.ssoId === undefined && q.hasOwnProperty('ssoId') && !user.ssoId) {
      // for local users only, e.g., login check
      return new User(user);
    }
    // If query specifies ssoId should not exist, enforce it
    if (q.ssoId === undefined && q.hasOwnProperty('ssoId') && user && user.ssoId !== undefined) {
      return null;
    }
    return user ? new User(user) : null;
  }

  // PUBLIC_INTERFACE
  static async findById(id) {
    if (!id) return null;
    const user = await storage.getById('users', id);
    return user ? new User(user) : null;
  }

  // PUBLIC_INTERFACE
  static async saveUser(userObj) {
    // Update or insert
    let exists = await storage.getById('users', userObj.id);
    if (exists) {
      await storage.update('users', userObj.id, userObj.toObject());
    } else {
      await storage.insert('users', userObj.toObject());
    }
    return userObj;
  }

  // PUBLIC_INTERFACE
  static async getAll() {
    const users = await storage.getAll('users');
    return users.map(u => new User(u));
  }

  // PUBLIC_INTERFACE
  static async updateById(id, data) {
    let user = await User.findById(id);
    if (!user) return null;
    Object.assign(user, data);
    await User.saveUser(user);
    return user;
  }
}

// Default export to maintain compatibility with original code
export default User;
