// Generates PWA icon PNGs (no image deps — hand-encodes valid RGBA PNGs).
// Dark FinFlow background with an emerald "F" mark. Re-run: `node scripts/gen-icons.cjs`.
const fs = require("fs");
const zlib = require("zlib");
const path = require("path");

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xEDB88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
function png(size) {
  const W = size, H = size;
  const bg = [0x0d, 0x0f, 0x12, 0xff];   // app background
  const fg = [0x00, 0xff, 0x88, 0xff];   // emerald accent
  const raw = Buffer.alloc(H * (1 + W * 4));
  // "F" geometry (kept within the maskable safe zone, ~0.1–0.9)
  const stemX0 = 0.30 * W, stemX1 = 0.44 * W, topY0 = 0.22 * H, botY1 = 0.78 * H;
  const topBarX1 = 0.70 * W, topBarY1 = 0.34 * H;
  const midBarX1 = 0.62 * W, midBarY0 = 0.46 * H, midBarY1 = 0.58 * H;
  for (let y = 0; y < H; y++) {
    const rs = y * (1 + W * 4);
    raw[rs] = 0; // filter: none
    for (let x = 0; x < W; x++) {
      const inStem = x >= stemX0 && x < stemX1 && y >= topY0 && y < botY1;
      const inTop = x >= stemX0 && x < topBarX1 && y >= topY0 && y < topBarY1;
      const inMid = x >= stemX0 && x < midBarX1 && y >= midBarY0 && y < midBarY1;
      const col = (inStem || inTop || inMid) ? fg : bg;
      const o = rs + 1 + x * 4;
      raw[o] = col[0]; raw[o + 1] = col[1]; raw[o + 2] = col[2]; raw[o + 3] = col[3];
    }
  }
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit, RGBA
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}
const out = path.join(__dirname, "..", "public");
fs.mkdirSync(out, { recursive: true });
[[192, "pwa-192x192.png"], [512, "pwa-512x512.png"], [180, "apple-touch-icon.png"]].forEach(([s, n]) => {
  fs.writeFileSync(path.join(out, n), png(s));
  console.log("wrote", n);
});
