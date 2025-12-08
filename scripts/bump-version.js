import fs from "fs";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

const [major, minor, patch] = pkg.version.split(".").map(Number);
const newVersion = `${major}.${minor}.${patch + 1}`;

pkg.version = newVersion;

fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2));

fs.writeFileSync(
  "version.json",
  JSON.stringify({ version: newVersion, build: Date.now() }, null, 2)
);

console.log(`✅ Version bumped to ${newVersion}`);
