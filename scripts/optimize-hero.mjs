import sharp from "sharp";

const input = "assets/trackflow-hero.png";

await sharp(input)
  .avif({ quality: 58, effort: 6 })
  .toFile("assets/trackflow-hero.avif");

await sharp(input)
  .webp({ quality: 78, effort: 6 })
  .toFile("assets/trackflow-hero.webp");
