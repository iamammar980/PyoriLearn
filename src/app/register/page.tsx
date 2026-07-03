import { redirect } from 'next/navigation';

// Registration is handled entirely by Google sign-in now.
export default function RegisterPage() {
  redirect('/login');
}
