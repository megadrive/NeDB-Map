# NeDB-Map

## JSON persistent storage with the familiar Map functionality, built on NeDB.

## Getting started

```js
const NeDBMap = require("nedb-map");
const db = new NeDBMap({
  filename: "yourdatabase.json"
});

// If you want to know when it's ready, usually not needed though.
db.on("ready", () => {
  // do stuff
});

/**
 * set, get, has, delete and clear all return promises.
 *
 * Keys must be strings, values can be anything.
 */
(async () => {
  await db.set("key", "Your value");
  // or
  await db.set("anotherkey", {key: "a value"})
  // or
  await db.set("yetanother", ["array", "of", "things"]);
  
  /**
   * You can update a key by using `set`.
   */
  await db.set("key", "a different value");

  // check for existance
  const exists = db.has("key"); // true

  // still with familiar syntax
  const retrievedValue = await db.get("key");

  // get multiple keys at once
  const { listof, manykeys } = await db.getMany(["listof", "manykeys"]);

  // delete a keypair
  await db.delete("listof");

  // clear _all_ entries. this will not prompt you. it will take effect immediately.
  // be 100% sure before using this.
  await db.clear();
})();
```
