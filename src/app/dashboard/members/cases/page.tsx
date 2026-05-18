import { redirect } from 'next/navigation';

export default function NestedCasesRedirectPage() {
  redirect('/dashboard/cases');
}
