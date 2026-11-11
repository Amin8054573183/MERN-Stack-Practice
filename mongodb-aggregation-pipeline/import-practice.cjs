// Run using mongosh --file; never evaluate the original shell-expression file.
const fs = require('fs');
const path = require('path');
const { isDeepStrictEqual } = require('util');
const practice = db.getSiblingDB('aggregation_practice');
const pingResult = practice.runCommand({ ping: 1 });
if (!pingResult || pingResult.ok !== 1) {
  throw new Error('MongoDB ping failed for aggregation_practice: ' + EJSON.stringify(pingResult));
}
const jobs = ['authors', 'books', 'data'].map(name => ({
  name, key: name === 'data' ? 'index' : '_id',
  docs: EJSON.parse(fs.readFileSync(path.join(__dirname, 'prepared', name + '.ejson'), 'utf8'), { relaxed: false })
}));
function comparable(doc, name) {
  const copy = { ...doc };
  if (name === 'data') delete copy._id;
  return EJSON.serialize(copy, { relaxed: false });
}
// Check ALL datasets before writing anything. Existing conflicting records stop import.
for (const job of jobs) {
  const col = practice.getCollection(job.name);
  for (const doc of job.docs) {
    const matches = col.find({ [job.key]: doc[job.key] }).toArray();
    if (matches.length > 1 || (matches.length === 1 &&
        !isDeepStrictEqual(comparable(matches[0], job.name), comparable(doc, job.name)))) {
      throw new Error('Existing duplicate or conflicting record in ' + job.name + ': ' + doc[job.key]);
    }
    if (job.name === 'data' && matches.length === 0 &&
        col.findOne({ _id: 'aggregation-practice:data:' + doc.index.toString() })) {
      throw new Error('Reserved import _id already exists');
    }
  }
}
// Run one importer at a time. Deterministic _ids also protect repeated inserts.
for (const job of jobs) {
  const col = practice.getCollection(job.name);
  let inserted = 0, skipped = 0;
  for (const doc of job.docs) {
    if (col.findOne({ [job.key]: doc[job.key] })) { skipped++; continue; }
    if (job.name === 'data') doc._id = 'aggregation-practice:data:' + doc.index.toString();
    col.insertOne(doc);
    inserted++;
  }
  const matched = col.countDocuments({ [job.key]: { $in: job.docs.map(d => d[job.key]) } });
  if (matched !== job.docs.length) {
    throw new Error('Import verification failed for aggregation_practice.' + job.name +
      ': expected ' + job.docs.length + ' source documents, found ' + matched);
  }
  printjson({ collection: job.name, inserted, skipped, matchedSourceDocuments: matched, totalDocuments: col.countDocuments({}) });
}
print('Find sample:');
printjson(practice.data.find({}, { _id: 0, index: 1, name: 1, age: 1, registered: 1 }).sort({ index: 1 }).limit(3).toArray());
print('BSON types:');
printjson(practice.data.aggregate([
  { $group: { _id: { index: { $type: '$index' }, age: { $type: '$age' }, registered: { $type: '$registered' } }, count: { $sum: 1 } } }
]).toArray());
print('Book/author aggregation:');
printjson(practice.books.aggregate([
  { $lookup: { from: 'authors', localField: 'author_id', foreignField: '_id', as: 'author' } },
  { $unwind: '$author' },
  { $sort: { _id: 1 } },
  { $project: { _id: 0, title: 1, author: '$author.name', genre: 1 } }
]).toArray());
