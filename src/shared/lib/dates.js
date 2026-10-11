import { nanoid } from 'nanoid';

export function localISODate(date = new Date()) {
  const yyyy = date.getFullYear();

  return `${yyyy}-${String(
    date.getMonth() + 1
  ).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
}

export function futureDate(days) {
  const d = new Date();

  d.setDate(
    d.getDate() + days
  );

  return localISODate(d);
}

export function formatDate(value) {
  return value
    ? new Date(
        `${value}T12:00:00`
      ).toLocaleDateString(
        'en-AU',
        {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }
      )
    : 'Not selected';
}

/*
|--------------------------------------------------------------------------
| SAFE UNIQUE TOKEN
|--------------------------------------------------------------------------
|
| nanoid works without requiring crypto.randomUUID().
|
| This fixes HTTP development URLs such as:
|
| http://192.168.1.150:6005
|
*/

export function makeToken(
  size = 21
) {
  return nanoid(size);
}

/*
|--------------------------------------------------------------------------
| INTERNAL ID
|--------------------------------------------------------------------------
*/

export function makeId(prefix) {
  return `${prefix}-${makeToken()}`;
}

/*
|--------------------------------------------------------------------------
| HUMAN-READABLE REFERENCE
|--------------------------------------------------------------------------
*/

export function makeReference(
  prefix = 'MC'
) {
  return `${prefix}-${Date.now()
    .toString(36)
    .toUpperCase()}-${makeToken(4).toUpperCase()}`;
}