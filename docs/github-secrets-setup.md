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

To verify your GitHub Actions secrets are correctly configured:

1. Go to your repository's Actions tab
2. Check if workflows using these secrets run successfully
3. Look specifically for AWS credential errors which indicate missing or invalid secrets
4. If you see "Credentials could not be loaded" errors, verify that:
   - Your AWS credentials are correctly entered in GitHub secrets
   - There are no extra spaces or line breaks in the secrets
   - You have proper permissions for the AWS resources being accessed

**Important Note**: Our CI/CD workflow is designed to fail if AWS credentials are not properly configured. This is intentional - failed deployments are better than partial or incorrect deployments that might lead to inconsistent infrastructure.

Your GitHub Actions workflow will now have access to these secrets when it runs. You don't need to modify the workflow file as it's already configured to use these secrets.

## Troubleshooting AWS Credential Issues

If your GitHub Actions workflow fails with AWS credential errors:

1. **Check Secret Names**: Ensure the secret names in GitHub exactly match what's expected in the workflow: `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`

2. **Verify Secret Values**: Re-add the secrets to ensure they contain the correct values without any leading/trailing whitespace

3. **Check AWS Permissions**: The AWS credentials must have sufficient permissions for the actions in the workflow (CloudFormation, S3, Lambda, etc.)

4. **Region Configuration**: Ensure the region in the workflow matches where your resources are deployed (`eu-north-1`)

5. **IAM User Rotation**: If you've recently rotated your AWS credentials, update the GitHub secrets accordingly

## Security Best Practices

1. **NEVER commit actual secret values to Git**
2. Store credentials in `.env` files locally (which are excluded from Git)
3. Rotate your access keys periodically
4. Use the principle of least privilege for all tokens and keys 