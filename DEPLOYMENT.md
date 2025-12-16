# Deployment to AWS Amplify

This document provides instructions for deploying the Estación Café Frontend to AWS Amplify.

## Prerequisites

- AWS Account with Amplify access
- GitHub repository connected to AWS Amplify
- Node.js 18.20.8+ or Node.js 20+ (configured in Amplify)

## Configuration Files

The project includes the following AWS Amplify configuration:

- **`amplify.yml`**: Build specification for AWS Amplify
- **`astro.config.mjs`**: Configured with `astro-aws-amplify` adapter for SSR

## Deployment Steps

### 1. Create AWS Amplify App

1. Log in to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click **"New app"** → **"Host web app"**
3. Select **GitHub** as the repository provider
4. Authorize AWS Amplify to access your GitHub account
5. Select your repository and branch (e.g., `main`)

### 2. Configure Build Settings

AWS Amplify will automatically detect the `amplify.yml` file. Verify the build settings:

- **Build command**: `npm run build`
- **Output directory**: `dist`
- **Node.js version**: 18.20.8 or higher (recommend 20.x)

### 3. Configure Environment Variables

Add the following environment variables in the Amplify Console under **App settings** → **Environment variables**:

#### Server-side Variables (SSR)
```
SERVER_BACKEND_API_URL=https://your-backend-api.com/api
SERVER_ML_API_URL=https://your-ml-api.com/api
SERVER_EMAIL_SERVICE_URL=https://your-email-service.com/api/send-report
```

#### Client-side Variables (Public)
```
PUBLIC_BACKEND_API_URL=https://your-backend-api.com/api
PUBLIC_ML_API_URL=https://your-ml-api.com/api
PUBLIC_EMAIL_SERVICE_URL=https://your-email-service.com/api/send-report
```

> **Important**: Replace the placeholder URLs with your actual production API endpoints.

### 4. Deploy

1. Click **"Save and deploy"**
2. AWS Amplify will build and deploy your application
3. Monitor the build process in the Amplify Console
4. Once complete, your app will be available at the provided Amplify URL

## Post-Deployment

### Custom Domain (Optional)

1. Go to **App settings** → **Domain management**
2. Click **"Add domain"**
3. Follow the instructions to configure your custom domain

### Monitoring

- **Build logs**: Available in the Amplify Console for each deployment
- **Application logs**: Check CloudWatch logs for SSR runtime errors

## Troubleshooting

### Build Failures

- Verify Node.js version is 18.20.8 or higher (or use Node.js 20+)
- Check that all dependencies are listed in `package.json`
- Review build logs in the Amplify Console

### Runtime Errors

- Verify environment variables are correctly set
- Check CloudWatch logs for SSR errors
- Ensure API endpoints are accessible from AWS

### Environment Variable Issues

- Server variables (`SERVER_*`) are only available during SSR
- Public variables (`PUBLIC_*`) are available in both SSR and client-side code
- Restart the app after changing environment variables

## Local Development

To test locally before deploying:

```bash
npm run dev
```

The local development server uses the `.env` file for environment variables.

## Additional Resources

- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [Astro AWS Amplify Adapter](https://github.com/astro-community/astro-aws-amplify)
- [Astro SSR Documentation](https://docs.astro.build/en/guides/server-side-rendering/)
