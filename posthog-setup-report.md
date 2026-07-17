# PostHog post-wizard report

The wizard completed the Expo/React Native PostHog integration for SubHub. It installed `posthog-react-native` and Expo-compatible dependencies, configured the PostHog public client variables, initialized a shared client at app startup, enabled lifecycle capture, added manual Expo Router screen tracking, and identifies Clerk users by their stable Clerk user ID. Authentication errors are sent to PostHog error tracking without including submitted credentials or email addresses in event properties.

| Event name | Description | File |
|---|---|---|
| `user_signed_in` | Captures a completed password sign-in, including whether MFA was used. | `app/(auth)/sign-in.tsx` |
| `user_signed_up` | Captures a completed signup after email-code verification. | `app/(auth)/sign-up.tsx` |
| `subscription_expanded` | Captures a user opening a subscription card, with subscription metadata. | `app/(tabs)/index.tsx` |
| `user_signed_out` | Captures a user signing out, then resets the client identity. | `app/(tabs)/settings.tsx` |

## Next steps

- [Analytics basics (wizard)](https://us.posthog.com/project/516050/dashboard/1861818)

The dashboard has been created. No saved insights were added yet because the newly instrumented custom events have not appeared in the project event schema; launch an updated build and exercise each flow, then create insights from the received events.

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add the exact PostHog env var names you added to `.env.example` and any monorepo/bootstrap scripts so collaborators know what to set.
- [ ] Confirm the returning-visitor path also calls `identify` — a handler that only identifies on fresh login can leave returning sessions on anonymous distinct IDs.

### Agent skill

An agent skill folder remains in the project for future agent development, providing current PostHog integration guidance.
