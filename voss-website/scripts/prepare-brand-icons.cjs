const fs = require('node:fs');
const sharp = require('sharp');

// Keep the original VOSS artwork. Remove its nearly neutral dark background
// by isolating the gold chroma before resizing, including inside the V.
async function main() {
  const { data, info } = await sharp('../Voss-Logos/Gemini_Generated_Image_ (2).jpg')
    .extract({ left: 276, top: 275, width: 472, height: 472 })
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const gold = data[i] - data[i + 2];
    data[i + 3] = Math.round(255 * Math.max(0, Math.min(1, (gold - 8) / 22)));
  }
  const logo = sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } });
  await logo.clone().resize(256, 256).png().toFile('src/app/icon.png');
  // Apple home-screen icons intentionally have an opaque background.
  await logo.clone().resize(180, 180).flatten({ background: '#101010' }).png().toFile('src/app/apple-icon.png');
  const sizes = [16, 32, 48];
  const pngs = await Promise.all(sizes.map(size => logo.clone().resize(size, size).ensureAlpha().png().toBuffer()));
  const header = Buffer.alloc(6 + 16 * sizes.length);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(sizes.length, 4);
  let offset = header.length;
  pngs.forEach((png, i) => {
    const p = 6 + 16 * i;
    header[p] = header[p + 1] = sizes[i];
    header.writeUInt16LE(1, p + 4);
    header.writeUInt16LE(32, p + 6);
    header.writeUInt32LE(png.length, p + 8);
    header.writeUInt32LE(offset, p + 12);
    offset += png.length;
  });
  fs.writeFileSync('src/app/favicon.ico', Buffer.concat([header, ...pngs]));
  console.log('Created transparent browser icons from the original gold V.');
}
main().catch(error => { console.error(error); process.exit(1); });
