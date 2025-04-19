# Setting Up GitHub Secrets for PikatchuPrice

This document guides you through setting up the necessary GitHub repository secrets for the automated versioning workflow.

## Secret Names Required

The following secrets need to be set up in your GitHub repository:

```
AWS_ACCESS_KEY_ID        # Your AWS access key
AWS_SECRET_ACCESS_KEY    # Your AWS secret key
NPM_TOKEN                # GitHub Personal Access Token with repo scope
```

**IMPORTANT: NEVER commit actual credential values to this repository.**

## Creating a GitHub Personal Access Token for NPM_TOKEN

Since we're only using semantic-release to update the version in the repository (not publishing to npm), you can use a GitHub Personal Access Token (PAT) for the NPM_TOKEN:

1. Go to your GitHub profile settings (click your profile picture > Settings)
2. Scroll down to "Developer settings" in the left sidebar
3. Click on "Personal access tokens" > "Tokens (classic)"
4. Click "Generate new token" > "Generate new token (classic)"
5. Name it something like "PikatchuPrice semantic-release"
6. Select the following scopes:
   - `repo` (Full control of private repositories)
   - If your repository is public, you can just select `public_repo` instead
7. Click "Generate token"
8. **Copy the token immediately** - you won't be able to see it again

## Adding Secrets to Your Repository

1. Go to your repository on GitHub
2. Click on "Settings" tab
3. In the left sidebar, click on "Secrets and variables" then "Actions"
4. Click "New repository secret"
5. Add each secret:

   For AWS credentials:
   - Name: `AWS_ACCESS_KEY_ID`
   - Value: [Your AWS access key]
   - Click "Add secret"

   - Name: `AWS_SECRET_ACCESS_KEY`
   - Value: [Your AWS secret key]
   - Click "Add secret"

   For semantic-release:
   - Name: `NPM_TOKEN`
   - Value: [The GitHub Personal Access Token you created]
   - Click "Add secret"

## Validation

Once all secrets are added, they should appear (with values hidden) in the "Repository secrets" section. 

Your GitHub Actions workflow will now have access to these secrets when it runs. You don't need to modify the workflow file as it's already configured to use these secrets.

## Security Best Practices

1. **NEVER commit actual secret values to Git**
2. Store credentials in `.env` files locally (which are excluded from Git)
3. Rotate your access keys periodically
4. Use the principle of least privilege for all tokens and keys 