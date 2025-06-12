'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import GoogleBtn from '../../../../components/ui/GoogleBtn';

type FormData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [setserverError, setSetserverError] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const form = useForm<FormData>();

  const handleSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <div className="w-full py-10 min-h-[85vh] bg-slate-100 dark:bg-slate-800">
      <h1 className="text-3xl font-Poppins font-semibold text-center">Login</h1>
      <p className="text-center text-lg py-3 text-slate-800">Welcome back, </p>
      <div className="w-full flex justify-center">
        <div className="p-8 bg-primary shadow rounded-lg md:w-[480px]">
          <h4 className="text-3xl text-center mb-2 font-medium">Login</h4>
          <p className="text-center text-slate-800 mb-4">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-blue-500">
              Sign up
            </Link>
          </p>

          <GoogleBtn />
        </div>
      </div>
    </div>
  );
}
