import * as storage from '../storage.js';

export class Comment {
  constructor(data) {
    this.id = data.id || data._id || (Date.now().toString() + Math.random().toString(36).slice(2, 8));
    this._id = this.id;
    this.post = data.post;
    this.author = data.author; // userId string
    this.body = data.body;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
  }

  // PUBLIC_INTERFACE
  static async find(query = {}) {
    let items = await storage.getAll('comments');
    items = items.filter(c => {
      let ok = true;
      if (query.post !== undefined) ok = ok && c.post === query.post;
      if (query.author !== undefined) ok = ok && c.author === query.author;
      if (query._id !== undefined) ok = ok && c._id === query._id;
      return ok;
    });
    // .sort({ createdAt: 1 }):
    if (query.$sortByCreatedAtAsc) {
      items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
    return items.map(c => new Comment(c));
  }

  // PUBLIC_INTERFACE
  static async findOne(query = {}) {
    const comments = await Comment.find(query);
    return comments.length > 0 ? comments[0] : null;
  }

  // PUBLIC_INTERFACE
  async save() {
    let exists = await storage.getById('comments', this.id);
    if (exists) {
      await storage.update('comments', this.id, this);
    } else {
      await storage.insert('comments', this);
    }
    return this;
  }

  // PUBLIC_INTERFACE
  static async findById(id) {
    const c = await storage.getById('comments', id);
    return c ? new Comment(c) : null;
  }
}

export default Comment;
