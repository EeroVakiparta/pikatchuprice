# PikatchuPrice Branching Strategy

This document outlines the branching strategy for the PikatchuPrice project to ensure a stable, organized development process.

## Overview

PikatchuPrice follows a simplified Git Flow approach with the following primary branches:

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Individual feature development

## Branch Descriptions

### Main Branch

The `main` branch always contains production-ready code that has been thoroughly tested and is ready for deployment:

- Represents the official release history
- Is protected and requires pull request reviews
- Only merges from the `develop` branch or hotfix branches
- Each merge to `main` triggers a deployment via GitHub Actions

### Develop Branch

The `develop` branch serves as an integration branch for features:

- Contains the latest delivered development changes
- Features are merged here first for integration testing
- When stable, is merged into `main` for release
- Should be kept in a deployable state

### Feature Branches

Feature branches are used for developing new features or enhancements:

- Named using the format `feature/descriptive-name`
- Created from the `develop` branch
- Merged back into `develop` via pull request when complete
- Deleted after successful merge

### Hotfix Branches

For critical fixes that need immediate attention:

- Named using the format `hotfix/descriptive-name`
- Created from `main`
- Merged to both `main` and `develop` when complete
- Should be used sparingly for urgent issues only

## Workflow Example

1. Start a new feature:
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/new-price-alert
   ```

2. Work on the feature, making regular commits using conventional commit format:
   ```bash
   git commit -m "feat: add price threshold settings"
   ```

3. When ready, push and create a pull request to the `develop` branch:
   ```bash
   git push -u origin feature/new-price-alert
   ```

4. After review and approval, merge the feature into `develop`

5. Once `develop` is stable and ready for release, create a pull request to merge into `main`

## Release Process

1. Features are accumulated in the `develop` branch
2. When ready for release, `develop` is merged into `main`
3. GitHub Actions automatically deploys the update based on semantic versioning
4. A tag is created for the release

## Commit Guidelines

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation changes
- `style:` - Formatting, missing semicolons, etc.
- `refactor:` - Code changes that neither fix bugs nor add features
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

This ensures proper semantic versioning and changelog generation. 