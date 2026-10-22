const [major, minor, patch] = process.versions.node.split(".").map(Number);
if (major !== 24 || minor < 22 || (minor === 22 && patch < 1)) {
  console.error(
    "This project requires Node 24.22.1 or a newer patched Node 24 release. See .nvmrc."
  );
  process.exit(1);
}
