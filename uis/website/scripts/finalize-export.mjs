import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const exportedPages = [
  ["index.html", "/"],
  ["application/index.html", "/application/"]
];
const outputDirectory = path.join(process.cwd(), "out");

for (const [fileName, canonicalPath] of exportedPages) {
  const filePath = path.join(outputDirectory, fileName);
  let html = await readFile(filePath, "utf8");
  const canonicalTag = html.match(/<link\b[^>]*\brel="canonical"[^>]*>/i)?.[0];

  if (!canonicalTag) {
    throw new Error(`The static export is missing a canonical link in ${fileName}.`);
  }

  const updatedCanonicalTag = canonicalTag.replace(
    /\bhref="[^"]*"/i,
    `href="${canonicalPath}"`
  );
  html = html.replace(canonicalTag, updatedCanonicalTag);

  if (!html.includes("</head>")) {
    throw new Error(`The static export is missing a head element in ${fileName}.`);
  }

  html = html.replace(
    "</head>",
    '  <meta property="og:image" content="/assets/trackflow-hero.png" />\n' +
      '  <meta name="twitter:image" content="/assets/trackflow-hero.png" />\n</head>'
  );
  await writeFile(filePath, html);
}
