import fs from 'fs/promises';
import path from 'path';

// The absolute data folder path (ensure it's created!)
const dataDir = path.join(process.cwd(), 'backend', 'data');
const dataFile = path.join(dataDir, 'db.json');

const initialData = {
  users: [],
  posts: [],
  comments: [],
  notifications: []
};

async function ensureDataFile() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, JSON.stringify(initialData, null, 2));
  }
}

/** Load the full database (all collections) as an object. */
async function loadDB() {
  await ensureDataFile();
  const data = await fs.readFile(dataFile, 'utf8');
  return JSON.parse(data);
}

/** Save the given dbObject to disk (overwrites all data). */
async function saveDB(dbObject) {
  await ensureDataFile();
  await fs.writeFile(dataFile, JSON.stringify(dbObject, null, 2));
}

/**
 * Get all records from a collection (e.g., 'users')
 * PUBLIC_INTERFACE
 */
export async function getAll(collection) {
  const db = await loadDB();
  return db[collection] || [];
}
/**
 * Find a record by id in a collection
 * PUBLIC_INTERFACE
 */
export async function getById(collection, id) {
  const items = await getAll(collection);
  return items.find(item => String(item.id) === String(id));
}
/**
 * Insert a new record into a collection
 * PUBLIC_INTERFACE
 */
export async function insert(collection, data) {
  const db = await loadDB();
  const items = db[collection] || [];
  // Simulate Mongo _id with string id
  const id = data.id || data._id || Date.now().toString() + Math.random().toString(36).substr(2, 7);
  const newDoc = { ...data, id, _id: id };
  items.push(newDoc);
  db[collection] = items;
  await saveDB(db);
  return newDoc;
}
/**
 * Update record by id in collection
 * PUBLIC_INTERFACE
 */
export async function update(collection, id, data) {
  const db = await loadDB();
  const items = db[collection] || [];
  const idx = items.findIndex(item => String(item.id) === String(id));
  if (idx === -1) return null;
  const updated = { ...items[idx], ...data, id, _id: id };
  items[idx] = updated;
  db[collection] = items;
  await saveDB(db);
  return updated;
}
/**
 * Remove a record by id
 * PUBLIC_INTERFACE
 */
export async function removeById(collection, id) {
  const db = await loadDB();
  const items = db[collection] || [];
  const idx = items.findIndex(item => String(item.id) === String(id));
  if (idx === -1) return false;
  items.splice(idx, 1);
  db[collection] = items;
  await saveDB(db);
  return true;
}
// For advanced query/filtering in-memory
export async function find(collection, predicate) {
  const arr = await getAll(collection);
  return arr.filter(predicate);
}
