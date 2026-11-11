// Read-only verification of stored BSON types in the practice database.
const verificationDb = db.getSiblingDB('aggregation_practice');
for (const [name, fields] of [
  ['authors', ['_id', 'birth_year']],
  ['books', ['_id', 'author_id']]
]) {
  const types = Object.fromEntries(fields.map(field => [field, { $type: '$' + field }]));
  printjson({ collection: name, bsonTypes: verificationDb.getCollection(name).aggregate([
    { $group: { _id: types, count: { $sum: 1 } } }
  ]).toArray() });
}
