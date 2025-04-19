# Commit Message Guidelines for PikatchuPrice

To take full advantage of our automated semantic versioning system, all commit messages should follow the [Conventional Commits](https://www.conventionalcommits.org/) format.

## Basic Structure

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

## Types

The type must be one of the following:

- `feat`: A new feature (triggers a MINOR version bump)
- `fix`: A bug fix (triggers a PATCH version bump)
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (formatting, etc.)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

## Breaking Changes

Breaking changes should be indicated by either:
- Adding a `!` after the type/scope: `feat!: breaking change`
- Adding a `BREAKING CHANGE:` footer: 
  ```
  feat: add new feature
  
  BREAKING CHANGE: incompatible with previous versions
  ```

These will trigger a MAJOR version bump.

## Scopes

Scopes are optional and should specify the package or component affected:
- `api`
- `ui`
- `lambda`
- `cdk`
- `db`
- etc.

## Examples

```
feat(ui): add user settings page
```

```
fix(api): resolve issue with price updates not saving
```

```
docs: update README installation instructions
```

```
feat!: replace authentication system
```

```
feat(lambda): add new notification feature

BREAKING CHANGE: requires new IAM permissions
```

## Automated Versioning Effects

- `fix` type commits → PATCH release (e.g., 1.0.0 → 1.0.1)
- `feat` type commits → MINOR release (e.g., 1.0.0 → 1.1.0)
- Commits with `BREAKING CHANGE` or `!` → MAJOR release (e.g., 1.0.0 → 2.0.0)

All version updates happen automatically when commits are pushed to the main branch. 