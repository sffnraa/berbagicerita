import { openDB } from 'idb';
 
const DATABASE_NAME = 'bagicerita';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'fav-stories';
 
const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade: (database) => {
    database.createObjectStore(OBJECT_STORE_NAME, {
      keyPath: 'id',
    });
  },
});

const Database = {
  async putStory(story) {
    if (!Object.hasOwn(story, 'id')) {
      throw new Error('`id` is required to favorite.');
    }
    return (await dbPromise).put(OBJECT_STORE_NAME, story);
  },
  async getDetailStory(id) {
    if (!id) {
        throw new Error('`id` is required.');  
    }
    return (await dbPromise).get(OBJECT_STORE_NAME, id);
  },
  async getAllStories() {
    return (await dbPromise).getAll(OBJECT_STORE_NAME);
  },
  async removeStory(id) {
    return (await dbPromise).delete(OBJECT_STORE_NAME, id);
  },
};

export default Database;