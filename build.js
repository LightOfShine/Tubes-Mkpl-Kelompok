/**
 * Minimal "build" step for the static Task Tracker app.
 * Copies source files into dist/ and stamps a build info comment.
 * This is intentionally simple since the project is a static site,
 * but it gives Continuous Integration something real to run and fail on
 * (e.g. missing files, bad syntax caught by a basic Node syntax check).
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src');
const DIST = path.join(__dirname, 'dist');

function clean() {
  if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true, force: true });
  }
  fs.mkdirSync(DIST, { recursive: true });
}

function copyFile(name) {
  const srcPath = path.join(SRC, name);
  if (!fs.existsSync(srcPath)) {
    throw new Error(`Build failed: required source file missing: ${name}`);
  }
  fs.copyFileSync(srcPath, path.join(DIST, name));
}

function validateJs(name) {
  // Basic syntax check: this will throw (and fail CI) on invalid JS.
  const content = fs.readFileSync(path.join(SRC, name), 'utf-8');
  try {
    // eslint-disable-next-line no-new, no-new-func
    new Function(content.replace(/^const \{[\s\S]*?\} = require\([^)]*\);?/m, ''));
  } catch (err) {
    throw new Error(`Build failed: syntax error in ${name}: ${err.message}`);
  }
}

function build() {
  console.log('Starting build...');
  clean();

  const requiredFiles = ['index.html', 'style.css', 'app.js', 'ui.js'];
  requiredFiles.forEach((f) => {
    console.log(`  Validating and copying ${f}`);
    if (f.endsWith('.js')) validateJs(f);
    copyFile(f);
  });

  const stamp = `<!-- build: ${new Date().toISOString()} -->\n`;
  fs.appendFileSync(path.join(DIST, 'index.html'), stamp);

  console.log('Build succeeded. Output in dist/');
}

build();
