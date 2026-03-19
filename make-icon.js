node -e "
const sharp = require('sharp');
const fs = require('fs');

sharp('public/icons8-pos-70.ico')
  .resize(256, 256)
  .png()
  .toBuffer()
  .then(pngBuf => {
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0);
    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(1, 4);
    const dir = Buffer.alloc(16);
    dir.writeUInt8(0, 0);
    dir.writeUInt8(0, 1);
    dir.writeUInt8(0, 2);
    dir.writeUInt8(0, 3);
    dir.writeUInt16LE(1, 4);
    dir.writeUInt16LE(32, 6);
    dir.writeUInt32LE(pngBuf.length, 8);
    dir.writeUInt32LE(22, 12);
    fs.writeFileSync('public/icon.ico', Buffer.concat([header, dir, pngBuf]));
    console.log('Done: public/icon.ico');
  })
  .catch(e => console.error(e.message));
"