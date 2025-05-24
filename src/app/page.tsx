import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/distiller');
  return null; // Redirect will prevent this from rendering
}
