"""Parse the complete source arrays without executing shell expressions."""
import collections
import datetime
import hashlib
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / '23-mongodb-aggregation-pipeline'
OUT = ROOT / 'prepared'
# Match strings first so constructor-like text inside strings stays untouched.
TOKEN = re.compile(r'"(?:[^"\\]|\\.)*"|NumberInt\((-?\d+)\)|ISODate\(("(?:[^"\\]|\\.)*")\)')

def convert(match):
    if match.group(1) is not None:
        value = int(match.group(1))
        if not -(2**31) <= value < 2**31:
            raise ValueError('NumberInt outside int32 range')
        return json.dumps({'$numberInt': str(value)})
    if match.group(2) is not None:
        date = datetime.datetime.fromisoformat(json.loads(match.group(2)))
        if date.tzinfo is None:
            raise ValueError('Date must include timezone')
        return json.dumps({'$date': date.astimezone(datetime.timezone.utc).isoformat(timespec='milliseconds').replace('+00:00', 'Z')})
    return match.group(0)

def schema(value, path, result):
    if isinstance(value, dict) and set(value) in ({'$numberInt'}, {'$date'}):
        result[path]['int32' if '$numberInt' in value else 'date'] += 1
    elif isinstance(value, dict):
        result[path]['object'] += 1
        for key, item in value.items():
            schema(item, f'{path}.{key}' if path else key, result)
    elif isinstance(value, list):
        result[path]['array'] += 1
        for item in value:
            schema(item, path + '[]', result)
    else:
        result[path][type(value).__name__] += 1

def main():
    OUT.mkdir(exist_ok=True)
    report = {}
    datasets = {}
    for name in ('authors', 'books', 'data'):
        raw = (SOURCE / f'{name}.json').read_bytes()
        docs = json.loads(TOKEN.sub(convert, raw.decode('utf-8-sig')))
        assert isinstance(docs, list) and all(isinstance(d, dict) for d in docs)
        key = 'index' if name == 'data' else '_id'
        keys = [int(d[key]['$numberInt']) if name == 'data' else d[key] for d in docs]
        assert len(set(keys)) == len(keys), f'Duplicate keys in {name}'
        types = collections.defaultdict(collections.Counter)
        for doc in docs:
            schema(doc, '', types)
        report[name] = {'count': len(docs), 'sha256': hashlib.sha256(raw).hexdigest(),
                        'schema': dict(types), 'unique_key': key, 'key_min': min(keys), 'key_max': max(keys)}
        (OUT / f'{name}.ejson').write_text(json.dumps(docs, indent=2) + '\n', encoding='utf-8')
        datasets[name] = docs
    assert all(b['author_id'] in {a['_id'] for a in datasets['authors']} for b in datasets['books'])
    report['relationships'] = 'All books.author_id values reference authors._id'
    (OUT / 'inspection.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(report, indent=2))

if __name__ == '__main__':
    main()
