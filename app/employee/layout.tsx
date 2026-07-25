'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useEmployeeStore } from '@/stores/employee.store';
import { EmployeeLayout } from '@/components/employee/EmployeeLayout';

const PUBLIC_PATHS = ['/employee/login'];

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, initUser } = useEmployeeStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    initUser();         // localStorage se user load karo
    setHydrated(true);  // tab tak kuch mat karo
  }, []);

  useEffect(() => {
    if (!hydrated) return;                    // initUser complete hone tak wait
    if (PUBLIC_PATHS.includes(pathname)) return; // login page pe redirect nahi

    if (!isLoggedIn) {
      router.replace('/employee/login');
    }
  }, [hydrated, isLoggedIn, pathname]);

  // Jab tak hydration complete nahi — blank screen (flash nahi hogi)
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="h-7 w-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Login page — layout wrap nahi
  if (PUBLIC_PATHS.includes(pathname)) {
    return <>{children}</>;
  }

  // Logged in nahi aur hydrated — kuch mat dikhao (redirect ho raha hai)
  if (!isLoggedIn) {
    return null;
  }

  // Protected pages
  return <EmployeeLayout>{children}</EmployeeLayout>;
}