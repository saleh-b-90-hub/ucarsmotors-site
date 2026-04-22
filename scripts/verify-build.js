const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const required = [
  "index.html",
  "cars.html",
  "parts.html",
  "services.html",
  "about.html",
  "contact.html",
  "assets/css/styles.css",
  "assets/js/main.js",
  "vercel.json",
];

for (const rel of required) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    console.error("Missing required file:", rel);
    process.exit(1);
  }
}

console.log("Build check OK:", required.length, "paths present.");
