'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    console.log('Home page - redirecting to login');
    router.push('/login');
  }, [router]);

  return <div>Redirecting...</div>;
}