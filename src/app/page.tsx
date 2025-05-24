
import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/step1-requirements'); // Redirect to the new Step 1 page
  return null; 
}
