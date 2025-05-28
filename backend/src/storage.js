import fs from 'fs/promises';
import path from 'path';

// Robust, cross-environment creation of backend/data/ and db.json on startup
const dataDir = path.join(process.cwd(), 'backend', 'data');
const dataFile = path.join(dataDir, 'db.json');

const initialData = {
  users: [],
  posts: [],
  comments: [],
  notifications: []
};

/**
 * Ensure backend/data directory and db.json (file-based database) exist.
 * Creates required directory and file at backend/src startup if missing.
 */
async function ensureDataFile() {
  // Ensure the directory exists, create recursively if missing
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (err) {
    // Directory creation failure: log and throw informative error
    console.error(`Failed to create data directory at ${dataDir}.`, err);
    throw new Error(`Cannot create backend/data directory: ${err.message}`);
  }

  // Ensure the db.json file exists (create it if missing)
  try {
    await fs.access(dataFile);
  } catch {
    // File does not exist, create with initial structure
    try {
      await fs.writeFile(dataFile, JSON.stringify(initialData, null, 2));
    } catch (err) {
      console.error(`Failed to initialize the data file at ${dataFile}.`, err);
      throw new Error(`Cannot create backend/data/db.json: ${err.message}`);
    }
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
  try {
    await fs.writeFile(dataFile, JSON.stringify(dbObject, null, 2));
  } catch (err) {
    console.error("File write error in saveDB for", dataFile, err);
    throw new Error("Failed to write data file. File-system permissions or disk full?");
  }
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
  try {
    await saveDB(db);
  } catch (err) {
    console.error(`Insert failed for collection ${collection}, data:`, data, err);
    throw err;
  }
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
  try {
    await saveDB(db);
  } catch (err) {
    console.error(`Update failed for collection ${collection}, id ${id}, data:`, data, err);
    throw err;
  }
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
