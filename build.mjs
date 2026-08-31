import { execSync } from "node:child_process";
import { cpSync, rmSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const LANDING = join(root, "landing");
const CATALOGO = join(root, "catalogo-mayorista");
const PUBLISH_DIR = join(root, "dist-site");

function run(cmd, cwd) {
  console.log(`\n> [${cwd}] ${cmd}`);
  execSync(cmd, { cwd, stdio: "inherit", shell: true });
}

rmSync(PUBLISH_DIR, { recursive: true, force: true });
mkdirSync(PUBLISH_DIR, { recursive: true });

run("npm ci", LANDING);
run("npm run build", LANDING);

run("npm ci", CATALOGO);
run("npm run build -- --base=/catalogo/", CATALOGO);

cpSync(join(LANDING, "dist"), PUBLISH_DIR, { recursive: true });
cpSync(join(CATALOGO, "dist"), join(PUBLISH_DIR, "catalogo"), { recursive: true });

console.log(`\nListo: ${PUBLISH_DIR}`);
