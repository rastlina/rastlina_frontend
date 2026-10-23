import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { StorySequence } from '../../src/components/home/journey/story-sequence.mjs';

const root = new URL('../../', import.meta.url);
const recipe = JSON.parse(await readFile(new URL('build/journey-media-repairs.json', root), 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

for (const file of recipe.files) test(`${file.output} retains the verified HD stream with mobile-compatible AVC metadata`, async () => {
  const source = await readFile(new URL(file.source, root));
  assert.equal(hash(source), file.source_sha256);
  const output = Buffer.concat(file.operations.map(operation => operation.copy
    ? source.subarray(operation.copy[0], operation.copy[0] + operation.copy[1])
    : Buffer.from(operation.data, 'base64')));
  assert.equal(hash(output), file.output_sha256);
  const header = output.indexOf('avcC');
  assert.ok(header > 0);
  assert.equal(output[header + 7], file.source.includes('-mobile') ? 31 : 32, 'Clip 3 must not advertise Level 6.2');
  assert.ok(output.indexOf('moov') < output.indexOf('mdat'), 'Metadata precedes video data for progressive playback');
});

test('normal and data-saving sequences both use the corrected, versioned clip 3 URL', () => {
  for (const mobile of [false, true]) {
    const layer = { video: {}, element: {} };
    class Scrubber { constructor() {} dispose() {} }
    const sequence = new StorySequence(Array(5).fill(layer), { Scrubber, assetBase: '/journey/assets', mobile });
    assert.equal(sequence.entries[2].source, `/journey/assets/story-03${mobile ? '-mobile' : ''}-v2.mp4`);
    sequence.dispose();
  }
});
