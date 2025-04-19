# Versioning Options for PikatchuPrice

This document outlines various options for implementing automatic versioning in the PikatchuPrice project.

## Introduction

Implementing proper versioning helps users identify which version of the application they're using, assists with debugging, and provides a clear record of changes. For PikatchuPrice, we need a solution that:

1. Automatically updates version numbers
2. Makes version information visible to users
3. Integrates with our Node.js/AWS stack
4. Works with our Git-based workflow

## Recommended Options

### Option 1: Standard-Version

[standard-version](https://github.com/conventional-changelog/standard-version) is a utility for versioning using semver and Conventional Commits.

**Features:**
- Automatic version bumping based on commit messages (feat: for minor, fix: for patch, BREAKING CHANGE: for major)
- Automatic CHANGELOG generation
- Git tag creation

**Setup:**

```bash
# Install the package
npm install --save-dev standard-version

# Add to package.json scripts
"scripts": {
  "release": "standard-version",
  "release:minor": "standard-version --release-as minor",
  "release:major": "standard-version --release-as major",
  "release:patch": "standard-version --release-as patch"
}
```

**Usage:**
```bash
npm run release
```

### Option 2: Custom Git-based Versioning

A custom solution using Git information to generate version numbers and build metadata.

**Setup:**

1. Create a `build.sh` file:
```bash
#!/bin/bash
git show -s --format='{"build": "%h", "date": "%cD", "author": "%an" }' > build.json
```

2. Create a `version.js` file:
```javascript
const fs = require('fs');
const { execSync } = require('child_process');
const pkg = require('./package.json');

// Get current version
const currentVersion = pkg.version.split('.');
let [major, minor, patch] = currentVersion.map(Number);

// Determine what to increment based on arguments
const arg = process.argv[2] || 'patch';
switch (arg) {
  case 'major':
    major++;
    minor = 0;
    patch = 0;
    break;
  case 'minor':
    minor++;
    patch = 0;
    break;
  case 'patch':
    patch++;
    break;
}

// Update package.json
pkg.version = `${major}.${minor}.${patch}`;
fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));

// Create build info
const buildHash = execSync('git rev-parse --short HEAD').toString().trim();
const buildDate = new Date().toISOString();
const buildInfo = {
  version: pkg.version,
  build: buildHash,
  date: buildDate
};

fs.writeFileSync('./public/version.json', JSON.stringify(buildInfo, null, 2));

console.log(`Version updated to ${pkg.version} (${buildHash})`);
```

3. Add to package.json scripts:
```json
"scripts": {
  "version:patch": "node version.js patch",
  "version:minor": "node version.js minor",
  "version:major": "node version.js major",
  "prebuild": "node version.js"
}
```

### Option 3: git-version-infer

[git-version-infer](https://github.com/apaleslimghost/git-version-infer) infers app versions based on Git history.

**Features:**
- Automatically determines version number based on Git commit history
- Uses number of merge commits as version number
- Appends commit hash for disambiguation

**Setup:**
```bash
# Install the package
npm install --save-dev @quarterto/git-version-infer

# Add to package.json scripts
"scripts": {
  "prebuild": "git-version-infer",
  "postinstall": "git-version-infer"
}
```

### Option 4: semantic-release

[semantic-release](https://github.com/semantic-release/semantic-release) automates the whole package release workflow.

**Features:**
- Fully automated releases
- Enforces semantic versioning
- Generates release notes
- Publishes packages
- Integrates with CI/CD

**Setup:**
```bash
# Install the package
npm install --save-dev semantic-release

# Create .releaserc.json
{
  "branches": ["main", "master"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/npm",
    "@semantic-release/github"
  ]
}
```

## Implementation Plan for PikatchuPrice

For PikatchuPrice, we have implemented **Option 4: semantic-release** as it:

1. Gives us fully automated versioning
2. Provides both version numbers and build information
3. Creates a `version.json` file that can be accessed by the frontend
4. Integrates seamlessly with GitHub Actions

The implementation includes:

1. A `.releaserc.json` configuration file
2. GitHub Actions workflow integration
3. Dynamic version display in the frontend
4. Conventional commit message format guidance

## Displaying Version Information to Users

The version information is visible to users in the application footer. It is loaded dynamically from version.json which is updated automatically with each release. 