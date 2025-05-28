import * as storage from '../storage.js';

export class Post {
  constructor(data) {
    this.id = data.id || data._id || (Date.now().toString() + Math.random().toString(36).slice(2, 8));
    this._id = this.id;
    this.author = data.author; // userId string
    this.title = data.title;
    this.body = data.body;
    this.tags = Array.isArray(data.tags) ? data.tags : [];
    this.featuredImage = data.featuredImage || "";
    this.likes = Array.isArray(data.likes) ? data.likes : [];
    this.reactions = Array.isArray(data.reactions) ? data.reactions : [];
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
    this.published = data.published !== undefined ? data.published : true;
  }

  // PUBLIC_INTERFACE
  static async find(query = {}) {
    // in-memory filter: simple Mongo-style logic
    let items = await storage.getAll('posts');
    // Filter
    items = items.filter(p => {
      let ok = true;
      if (query.published !== undefined) ok = ok && p.published === query.published;
      if (query.author) ok = ok && p.author === query.author;
      if (query._id) ok = ok && p._id === query._id;
      // Query $or for search
      if (query.$or) {
        ok = ok && query.$or.some(cond => {
          if (cond.title && cond.title.$regex) {
            const re = new RegExp(cond.title.$regex, cond.title.$options);
            return re.test(p.title);
          }
          if (cond.body && cond.body.$regex) {
            const re = new RegExp(cond.body.$regex, cond.body.$options);
            return re.test(p.body);
          }
          return false;
        });
      }
      // tags
      if (query.tags && query.tags.$in) {
        ok = ok && p.tags && p.tags.some(tag => query.tags.$in.includes(tag));
      }
      return ok;
    });
    // Optionally sort (simulate .sort())
    if (query.$sorter) {
      items.sort(query.$sorter);
    }
    // .skip() and .limit()
    if (query.$skip !== undefined && query.$limit !== undefined) {
      items = items.slice(query.$skip, query.$skip + query.$limit);
    }
    return items.map(p => new Post(p));
  }

  // PUBLIC_INTERFACE
  static async aggregate(pipeline) {
    // For tags aggregation, only implemented for existing pipeline
    // [
    //   { $match: { published: true } },
    //   { $unwind: "$tags" },
    //   { $group: { _id: null, tagSet: { $addToSet: "$tags" } } },
    //   { $project: { _id: 0, tags: { $sortArray: { input: "$tagSet", sortBy: 1 } } } }
    // ]
    const all = await storage.getAll('posts');
    // $match
    let filtered = all.filter(p => p.published);
    // $unwind tags
    let tags = [];
    filtered.forEach(p => {
      if (Array.isArray(p.tags)) {
        tags.push(...p.tags);
      }
    });
    // $group and $addToSet
    let tagSet = Array.from(new Set(tags));
    // $sortArray
    tagSet.sort();
    return [{ tags: tagSet }];
  }

  // PUBLIC_INTERFACE
  static async findOne(query) {
    const posts = await Post.find(query);
    return posts.length > 0 ? posts[0] : null;
  }

  // PUBLIC_INTERFACE
  static async findById(id) {
    const post = await storage.getById('posts', id);
    return post ? new Post(post) : null;
  }

  // PUBLIC_INTERFACE
  async save() {
    // If id exists, update, else insert
    let exists = await storage.getById('posts', this.id);
    if (exists) {
      await storage.update('posts', this.id, this);
    } else {
      await storage.insert('posts', this);
    }
    return this;
  }
}

export default Post;
