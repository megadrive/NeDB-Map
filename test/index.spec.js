
const { unlinkSync } = require("fs");
const { join } = require("path");

const databaseFilename = "test.spec.json"

const NeDBMap = require("../");
const db = new NeDBMap({filename: databaseFilename});

const rand = function(length) {
  const alpha = ["A","a","B","b","C","c","D","d","E","e","F","f","G","g","H","h","I","i","J","j","K","k","L","l","M","m","N","n","O","o","P","p","Q","q","R","r","S","s","T","t","U","u","V","v","W","w","X","x","Y","y","Z","z"];
  const num = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const chars = [...alpha, ...num];

  const rv = [];
  for(let i = 0; i < length; i++){
    rv.push(chars[Math.floor(Math.random() * chars.length)]);
  }
  return rv.join("");
};

let doc;
test("set a key:value pair", async () => {
  doc = await db.set("deleteKey", rand(12));
  await db.set(`key${rand(5)}`, rand(12));
  expect(db.size).toEqual(2);
});

test("delete a key", async () => {
  await db.delete(doc.key);
  expect(db.size).toEqual(1);
});

test("add many keys quickly at once and have size set properly", async () => {
  await db.set(`getMeLater`, rand(12));
  await db.set(`key${rand(5)}`, rand(12));
  await db.set(`key${rand(5)}`, rand(12));
  await db.set(`key${rand(5)}`, rand(12));
  await db.set(`key${rand(5)}`, rand(12));
  await db.set(`key${rand(5)}`, rand(12));
  await db.set(`key${rand(5)}`, rand(12));
  expect(db.size).toEqual(8);
});

test("find a single key:value", async () => {
  await db.set("findMe", "Found!");
  const found = await db.get("findMe");
  expect(found).toBe("Found!");
});

test("existance", async () => {
  const exists = await db.has("findMe");
  expect(exists).not.toBeFalsy();
});

test("update a key, after a set has been used", async () => {
  await db.set("findMe", "I have been updated!");
  const foundAgain = await db.get("findMe");
  expect(foundAgain).toBe("I have been updated!");
});

test("get multiple keys, as an object of objects", async () => {
  const { findMe, getMeLater } = await db.getMany(["findMe", "getMeLater"]);
  expect(findMe).not.toBeUndefined();
  expect(getMeLater).not.toBeUndefined();
});

test("give a list of all keys", () => {
  const keys = db.keys();
  expect(keys).not.toBeNull();
  expect(keys).not.toBeUndefined();
});

test("clear all entries in the collection, with a size of 0", async () => {
  await db.clear();  
  expect(db.size).toEqual(0);
});
