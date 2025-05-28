import * as storage from '../storage.js';

export class Notification {
  constructor(data) {
    this.id = data.id || data._id || (Date.now().toString() + Math.random().toString(36).slice(2, 8));
    this._id = this.id;
    this.sender = data.sender;
    this.recipient = data.recipient;
    this.type = data.type;
    this.message = data.message;
    this.unread = 'unread' in data ? data.unread : true;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
  }

  // PUBLIC_INTERFACE
  static async find(query = {}) {
    let items = await storage.getAll('notifications');
    items = items.filter(n => {
      let ok = true;
      if (query.recipient !== undefined) ok = ok && n.recipient === query.recipient;
      if (query.unread !== undefined) ok = ok && n.unread === query.unread;
      if (query._id !== undefined) ok = ok && n._id === query._id;
      return ok;
    });
    if (query.$sort === -1) {
      items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return items.map(n => new Notification(n));
  }

  // PUBLIC_INTERFACE
  static async findOne(query = {}) {
    const items = await Notification.find(query);
    return items.length > 0 ? items[0] : null;
  }

  // PUBLIC_INTERFACE
  async save() {
    const exists = await storage.getById('notifications', this.id);
    if (exists) {
      await storage.update('notifications', this.id, this);
    } else {
      await storage.insert('notifications', this);
    }
    return this;
  }

  // PUBLIC_INTERFACE
  static async findById(id) {
    const n = await storage.getById('notifications', id);
    return n ? new Notification(n) : null;
  }
}

export default Notification;
