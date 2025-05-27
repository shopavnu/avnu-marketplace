#!/usr/bin/env node
/**
 * Monorepo Dependency Hoister
 *
 * Scans all workspaces' dependencies and ensures root package.json includes them (with matching versions).
 * Usage:
 *   node scripts/hoist-frontend-deps.js [--write] [--align-versions] [--exclude dep1,dep2,...] [--remove-orphans] [--help]
 *
 *  --write           Actually update root package.json (otherwise, dry-run only)
 *  --align-versions  Align root dep versions to match the workspace version if mismatched
 *  --exclude         Comma-separated list of deps to ignore (never hoist)
 *  --remove-orphans  Remove root deps not used in any workspace (safe by default)
 *  --help            Show usage
 */
const fs = require('fs');
const path = require('path');
const glob = require('glob');

function usage() {
  console.log(`\nMonorepo Dependency Hoister\n\nUsage:\n  node scripts/hoist-frontend-deps.js [--write] [--align-versions] [--exclude dep1,dep2,...] [--remove-orphans] [--help]\n\nFlags:\n  --write           Actually update root package.json (otherwise, dry-run only)\n  --align-versions  Align root dep versions to match the workspace version if mismatched\n  --exclude         Comma-separated list of deps to ignore (never hoist)\n  --remove-orphans  Remove root deps not used in any workspace (safe by default)\n  --help            Show usage\n`);
}

const args = process.argv.slice(2);
if (args.includes('--help')) {
  usage();
  process.exit(0);
}
const DO_WRITE = args.includes('--write');
const ALIGN_VERSIONS = args.includes('--align-versions');
const REMOVE_ORPHANS = args.includes('--remove-orphans');
const HOIST_PEERS = args.includes('--hoist-peers');
const EXCLUDES = (() => {
  const ix = args.indexOf('--exclude');
  if (ix !== -1 && args.length > ix + 1) {
    return args[ix + 1].split(',').map(s => s.trim());
  }
  return [];
})();

const rootPkgPath = path.resolve(__dirname, '../package.json');
const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf8'));
const workspaces = rootPkg.workspaces || [];
const rootDeps = rootPkg.dependencies || {};
const rootDevDeps = rootPkg.devDependencies || {};

// --- Resolve all workspace package.json files (support globs) ---
let workspacePkgPaths = [];
for (const wsPattern of workspaces) {
  // If the pattern is a directory, append package.json
  if (!wsPattern.includes('*')) {
    const pkgPath = path.resolve(__dirname, '..', wsPattern, 'package.json');
    if (fs.existsSync(pkgPath)) workspacePkgPaths.push(pkgPath);
  } else {
    const matches = glob.sync(path.resolve(__dirname, '..', wsPattern, 'package.json'));
    workspacePkgPaths.push(...matches);
  }
}

// --- Aggregate all deps from all workspaces ---
let allWorkspaceDeps = {};
let allWorkspaceDevDeps = {};
let allWorkspacePeerDeps = {};
for (const wsPath of workspacePkgPaths) {
  const wsPkg = JSON.parse(fs.readFileSync(wsPath, 'utf8'));
  Object.assign(allWorkspaceDeps, wsPkg.dependencies || {});
  Object.assign(allWorkspaceDevDeps, wsPkg.devDependencies || {});
  Object.assign(allWorkspacePeerDeps, wsPkg.peerDependencies || {});
}

// Remove excluded deps from workspace deps
for (const dep of EXCLUDES) {
  delete allWorkspaceDeps[dep];
  delete allWorkspaceDevDeps[dep];
  delete allWorkspacePeerDeps[dep];
}

// Find missing and mismatched deps
const missingDeps = [];
const mismatchedDeps = [];
for (const [dep, version] of Object.entries(allWorkspaceDeps)) {
  if (!(dep in rootDeps)) {
    missingDeps.push({ dep, version });
  } else if (rootDeps[dep] !== version) {
    mismatchedDeps.push({ dep, rootVersion: rootDeps[dep], wsVersion: version });
  }
}

// Peer dependencies: warn or hoist
const missingPeerDeps = [];
const mismatchedPeerDeps = [];
for (const [dep, version] of Object.entries(allWorkspacePeerDeps)) {
  if (!(dep in rootDeps)) {
    missingPeerDeps.push({ dep, version });
  } else if (rootDeps[dep] !== version) {
    mismatchedPeerDeps.push({ dep, rootVersion: rootDeps[dep], wsVersion: version });
  }
}

// Optionally, do the same for devDependencies (comment out if not desired)
// const missingDevDeps = [];
// const mismatchedDevDeps = [];
// for (const [dep, version] of Object.entries(allWorkspaceDevDeps)) {
//   if (!(dep in rootDevDeps)) {
//     missingDevDeps.push({ dep, version });
//   } else if (rootDevDeps[dep] !== version) {
//     mismatchedDevDeps.push({ dep, rootVersion: rootDevDeps[dep], wsVersion: version });
//   }
// }

// Find orphans (root deps not used in any workspace)
const orphans = [];
if (REMOVE_ORPHANS) {
  for (const dep of Object.keys(rootDeps)) {
    if (!(dep in allWorkspaceDeps) && !(dep in allWorkspacePeerDeps)) {
      orphans.push(dep);
    }
  }
}

// --- Reporting ---
console.log('\n--- Monorepo Dependency Hoister Report ---');
if (missingDeps.length === 0 && mismatchedDeps.length === 0 && missingPeerDeps.length === 0 && mismatchedPeerDeps.length === 0 && orphans.length === 0) {
  console.log('All workspace dependencies are present and match in root package.json.');
} else {
  if (missingDeps.length) {
    console.log('\nMissing dependencies to add to root package.json:');
    for (const { dep, version } of missingDeps) {
      console.log(`  "${dep}": "${version}",`);
    }
  }
  if (mismatchedDeps.length) {
    console.log('\nVersion mismatches:');
    for (const { dep, rootVersion, wsVersion } of mismatchedDeps) {
      console.log(`  "${dep}": root=${rootVersion}, workspace=${wsVersion}`);
    }
    if (ALIGN_VERSIONS) {
      console.log('  (Will align root version to workspace version)');
    }
  }
  if (missingPeerDeps.length) {
    console.log(`\nMissing peerDependencies in root package.json:`);
    for (const { dep, version } of missingPeerDeps) {
      console.log(`  "${dep}": "${version}",`);
    }
    if (HOIST_PEERS) {
      console.log('  (Will hoist these to root)');
    }
  }
  if (mismatchedPeerDeps.length) {
    console.log(`\nPeer dependency version mismatches:`);
    for (const { dep, rootVersion, wsVersion } of mismatchedPeerDeps) {
      console.log(`  "${dep}": root=${rootVersion}, workspace(peer)=${wsVersion}`);
    }
    if (ALIGN_VERSIONS && HOIST_PEERS) {
      console.log('  (Will align root peer dep version to workspace version)');
    }
  }
  if (orphans.length) {
    console.log('\nOrphaned root dependencies (not used in any workspace):');
    for (const dep of orphans) {
      console.log(`  "${dep}"`);
    }
    if (REMOVE_ORPHANS) {
      console.log('  (Will remove these from root)');
    }
  }
}

// --- Write changes if requested ---
if (DO_WRITE) {
  let changed = false;
  for (const { dep, version } of missingDeps) {
    rootPkg.dependencies[dep] = version;
    changed = true;
  }
  if (ALIGN_VERSIONS) {
    for (const { dep, wsVersion } of mismatchedDeps) {
      rootPkg.dependencies[dep] = wsVersion;
      changed = true;
    }
  }
  // Hoist peer deps if requested
  if (HOIST_PEERS) {
    for (const { dep, version } of missingPeerDeps) {
      rootPkg.dependencies[dep] = version;
      changed = true;
    }
    if (ALIGN_VERSIONS) {
      for (const { dep, wsVersion } of mismatchedPeerDeps) {
        rootPkg.dependencies[dep] = wsVersion;
        changed = true;
      }
    }
  }
  if (REMOVE_ORPHANS) {
    for (const dep of orphans) {
      delete rootPkg.dependencies[dep];
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(rootPkgPath, JSON.stringify(rootPkg, null, 2) + '\n', 'utf8');
    console.log('\nUpdated root package.json! Run npm install to update your lockfile.');
  } else {
    console.log('\nNo changes needed.');
  }
} else {
  console.log('\n(DRY RUN: Run with --write to update root package.json)');
}
