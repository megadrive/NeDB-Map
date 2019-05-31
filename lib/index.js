
const { EventEmitter } = require("events");
const { join } = require("path");
const Datastore = require("nedb");

const log = require("debug")("nedbmap");

/**
 * NeDBMap is an `NeDB` database with `Map` utility functions for ease of use.
 * 
 * Listen for the `ready` event.
 */
class NeDBMap extends EventEmitter {
  constructor(options) {
    super();

    options.filename = join("data", ...options.filename.split(/[\/\\]/));
    options.autoload = true;
    options.onload = () => {
      this.emit("ready", this);
    };

    this.db = new Datastore(options);
  }

  /**
   * Returns the number of items in the collection.
   * @returns {number}
   */
  get size() {
    return this.db.getAllData().length;
  }

  /**
   * Set a key.
   * @param {string} key Key to set
   * @param {any} value Value for key
   * @returns {Promise<any|Error>} The value, or an error.
   */
  set(key, value) {
    return new Promise((resolve, reject) => {
      this.has(key)
        .then(has => {
          if(has) {
            this.db.update({key}, {key, value}, {}, (err, numUpdated) => {
              if(err) {
                reject(err);
              }
      
              if(numUpdated > 0) {
                resolve({key, value});
              }
            });
          } else {
            log(`Inserting a document ${key}: ${value}`);
            this.db.insert({key,value}, (err, doc) => {
              if(err) {
                reject(err);
              }

              resolve(doc);
            });
          }
        });
    });
  }

  /**
   * Get a single value by key.
   * @param {string} key The key to get.
   * @returns {Promise<any>} The retrieved value.
   */
  async get(key) {
    log(`Getting key: ${key}`)
    const docs = await this.getMany([key]);
    return docs[key] ? docs[key] : null;
  }

  /**
   * Get many values by keys.
   * @param {string[]} keys Array of keys to get.
   * @returns {Promise<{key: string, value: any}[]>} Array of objects, Object key is key.
   */
  getMany(keys) {
    return new Promise((resolve, reject) => {
      this.db.find({
        key: new RegExp("(" + keys.join("|") + ")")
      }, (err, documents) => {
        if(err) {
          reject(err);
        }
  
        // [{}, {}]
        let rv = {};
        documents.forEach((item) => {
          rv[item.key] = item.value;
        });
        resolve(rv);
      });
    });
  }

  /**
   * Finds out if `key` exists in the NeDBMap.
   * @param {string} key Key to find.
   * @returns {Promise<boolean>} Always returns a resolved Promise.
   */
  has(key) {
    return new Promise((resolve, reject) => {
      this.db.findOne({key}, (err, doc) => {
        if(err) {
          reject(err);
        }
  
        if(doc) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  /**
   * Deletes a key:value pair.
   * @param {string} key Key to remove
   * @returns {Promise<boolean>} Promise with whether or not successfully removed.
   */
  delete(key) {
    return new Promise((resolve, reject) => {
      log(`Deleting ${key}`)
      this.db.remove({key}, {}, (err, numRemoved) => {
        if(err) {
          reject(err);
        }
  
        resolve(numRemoved > 0);
      });
    });
  }

  /**
   * Removes **ALL** entries.
   * 
   * *** USE WITH CARE ***
   * @returns {Promise<boolean>}
   */
  clear() {
    return new Promise((resolve, reject) => {
      this.db.remove({}, {multi: true}, (err, numRemoved) => {
        if(err) {
          reject(err);
        }
  
        resolve(numRemoved > 0);
      });
    });
  }

  /**
   * Returns an array of all the keys.
   * @returns {string[]} The keys.
   */
  keys() {
    return this.db.getAllData()
      .map(pair => pair.key)
      .filter(key => key !== undefined)
    ;
  }
}

module.exports.NeDBMap = NeDBMap;
