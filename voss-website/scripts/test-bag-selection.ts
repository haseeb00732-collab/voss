import assert from 'node:assert/strict';
import { changeBagColour } from '../src/lib/bag-selection';
const items = [
  { slug: 'tote', colour: 'black', quantity: 2 },
  { slug: 'tote', colour: 'brown', quantity: 3 },
  { slug: 'other', colour: 'black', quantity: 1 },
];
assert.deepEqual(changeBagColour(items, 0, 'green'), [{ ...items[0], colour: 'green' }, items[1], items[2]]);
assert.deepEqual(changeBagColour(items, 0, 'brown'), [{ ...items[1], quantity: 5 }, items[2]]);
assert.deepEqual(changeBagColour(items, 1, 'black'), [{ ...items[0], quantity: 5 }, items[2]]);
assert.equal(changeBagColour(items, 0, 'black'), items);
assert.throws(() => changeBagColour([{ ...items[0], quantity: 20 }, items[1]], 1, 'black'), /up to 20/);
assert.equal(items[0].quantity, 2, 'Changing colour must not mutate saved selections');
console.log('PASS: Colour changes preserve quantities, combine duplicates and reject overflow without dropping items.');
