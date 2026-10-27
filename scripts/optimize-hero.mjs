import sharp from "sharp";

const input = "uis/website/assets/trackflow-hero.png";

await sharp(input)
  .avif({ quality: 58, effort: 6 })
  .toFile("uis/website/assets/trackflow-hero.avif");

await sharp(input)
  .webp({ quality: 78, effort: 6 })
  .toFile("uis/website/assets/trackflow-hero.webp");
