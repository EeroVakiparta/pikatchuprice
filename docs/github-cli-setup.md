# GitHub CLI Setup and Usage

This guide explains how to set up and use the GitHub CLI (`gh`) for monitoring workflows and interacting with the PikatchuPrice repository.

## Installation

### Windows

1. Using winget (recommended):
   ```powershell
   winget install GitHub.cli
   ```

2. Using Chocolatey:
   ```powershell
   choco install gh
   ```

3. Direct download:
   - Visit [https://cli.github.com/](https://cli.github.com/)
   - Download and run the installer

### macOS

```bash
brew install gh
```

### Linux

**Ubuntu/Debian:**
```bash
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh
```

**Fedora/RHEL:**
```bash
sudo dnf install gh
```

## Authentication

After installation, authenticate with your GitHub account:

```bash
gh auth login
```

Follow the interactive prompts. You can choose between HTTPS or SSH authentication and browser or token authentication.

## Common Commands for PikatchuPrice

### Checking Workflow Status

Display recent workflow runs for PikatchuPrice:

```bash
# List all workflow runs
gh run list -R EeroVakiparta/pikatchuprice

# Check the latest workflow run
gh run list -R EeroVakiparta/pikatchuprice -L 1

# Watch a specific workflow run until completion
gh run watch -R EeroVakiparta/pikatchuprice <run-id>
```

### Working with Releases

```bash
# List releases
gh release list -R EeroVakiparta/pikatchuprice

# View the latest release
gh release view -R EeroVakiparta/pikatchuprice
```

### Creating Pull Requests

```bash
# Create a PR from your current branch
gh pr create --title "Your PR title" --body "Description of changes"

# List open PRs
gh pr list -R EeroVakiparta/pikatchuprice
```

### Managing Issues

```bash
# Create an issue
gh issue create --title "Issue title" --body "Issue description"

# List open issues
gh issue list -R EeroVakiparta/pikatchuprice
```

## CI/CD Monitoring

To specifically monitor the CI/CD pipeline for PikatchuPrice:

```bash
# View recent CI/CD workflow runs
gh workflow list -R EeroVakiparta/pikatchuprice
gh run list -R EeroVakiparta/pikatchuprice --workflow "Deploy PikatchuPrice CDK Stack"

# View logs of the latest run
gh run view -R EeroVakiparta/pikatchuprice $(gh run list -R EeroVakiparta/pikatchuprice --workflow "Deploy PikatchuPrice CDK Stack" --limit 1 --json databaseId --jq '.[0].databaseId')
```

## GitHub Actions Debugging

If you need to debug GitHub Actions:

```bash
# Enable debug logs in your own workflow runs
gh workflow run "Deploy PikatchuPrice CDK Stack" --debug
```

For more information on using GitHub CLI, refer to the [official documentation](https://cli.github.com/manual/). 