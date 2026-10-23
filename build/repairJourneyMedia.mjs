import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Reproduce the lossless FFmpeg metadata repair from the retained source files.
// The small copy/literal recipe avoids storing another 16 MB of identical video.
// Source and output hashes make a changed or incomplete media file fail the build.
const root = new URL('../', import.meta.url);
const recipe = JSON.parse(await readFile(new URL('journey-media-repairs.json', import.meta.url), 'utf8'));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');

for (const file of recipe.files) {
  const source = await readFile(new URL(file.source, root));
  if (digest(source) !== file.source_sha256) throw new Error(`Unexpected source video: ${file.source}`);
  const output = new URL(file.output, root);
  const existing = await readFile(output).catch(error => {
    if (error.code !== 'ENOENT') throw error;
    return null;
  });
  if (existing && digest(existing) === file.output_sha256) continue;
  const bytes = Buffer.concat(file.operations.map(operation => {
    if (operation.copy) {
      const [offset, length] = operation.copy;
      return source.subarray(offset, offset + length);
    }
    return Buffer.from(operation.data, 'base64');
  }));
  if (digest(bytes) !== file.output_sha256) throw new Error(`Invalid media repair: ${file.output}`);
  await writeFile(output, bytes);
  console.log(`Prepared compatible video: ${fileURLToPath(output).split('/').pop()}`);
}
