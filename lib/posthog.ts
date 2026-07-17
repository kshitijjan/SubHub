import PostHog from 'posthog-react-native'

const projectToken = process.env.EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST

const isConfigured = Boolean(projectToken && host && projectToken !== 'phc_your_project_token_here')

if (!isConfigured) {
  console.warn('PostHog environment variables are missing or use placeholders. Analytics will be disabled.')
}

export const posthog = new PostHog(projectToken || 'placeholder_key', {
  host: host || 'https://us.i.posthog.com',
  disabled: !isConfigured,
  captureAppLifecycleEvents: true,
  debug: __DEV__,
})
