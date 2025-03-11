"use client"
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

const App = () => {
  const router = useRouter();

  useEffect(() => {
    router.push('/auth');
  }, []);


  return null;
}

export default App;
