#!/usr/bin/env node
/*
 * kill-port.js
 * Simple utility to free up port 8080 before starting NestJS in dev mode.
 */
const { execSync } = require('child_process');
const kill = require('tree-kill');

const PORT = process.env.PORT || '8080';

function getPid(port) {
  try {
    const result = execSync(`lsof -ti tcp:${port}`).toString().trim();
    return result || null;
  } catch (e) {
    return null; // lsof exits non-zero when nothing is found
  }
}

const pid = getPid(PORT);

if (pid) {
  console.log(`freeing port ${PORT}: killing pid ${pid}`);
  try {
    kill(parseInt(pid, 10));
  } catch (e) {
    console.warn(`failed to kill pid ${pid}:`, e.message);
  }
}
