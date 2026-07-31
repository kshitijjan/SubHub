import { useSignIn } from '@clerk/expo';
export function Test() {
  const { signIn } = useSignIn();
  signIn.create({ identifier: 'test' });
}
