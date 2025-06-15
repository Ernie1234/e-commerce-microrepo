'use client';

import React from 'react';

import useUser from '../../hooks/auth-hooks/useUser';
import Link from 'next/link';
import { FaRegUser } from 'react-icons/fa';
import Image from 'next/image';

export default function UserHeader() {
  const { user } = useUser();
  return (
    <>
      {user ? (
        <>
          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className="border-2 p-1 flex items-center justify-center rounded-full hover:bg-hover hover:border-muted-foreground group transition-all duration-500 dark:hover:bg-hover dark:border-muted-foreground"
            >
              {user.image ? (
                <Image
                  src={user.image}
                  alt={`${user.name} image`}
                  className="h-6 w-6 rounded-full object-cover"
                  height={100}
                  width={100}
                />
              ) : (
                <FaRegUser className="group-hover:text-muted-foreground transition-all duration-500 dark:text-muted-foreground dark:group-hover:text-foreground" />
              )}
            </Link>
          </div>
          <Link href="/profile">
            <span className="block font-Poppins text-sm dark:text-muted-foreground">
              Hello,
            </span>
            <span className="font-semibold font-Poppins text-base dark:text-foreground">
              {user?.name?.split(' ')[0]}
            </span>
          </Link>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="border-2 p-1 flex items-center justify-center rounded-full hover:bg-hover hover:border-muted-foreground group transition-all duration-500 dark:hover:bg-hover dark:border-muted-foreground"
            >
              <FaRegUser className="group-hover:text-muted-foreground transition-all duration-500 dark:text-muted-foreground dark:group-hover:text-foreground" />
            </Link>
          </div>
          <Link href="/login">
            <span className="block font-Poppins text-sm dark:text-muted-foreground">
              Hello,
            </span>
            <span className="font-semibold font-Poppins text-base dark:text-foreground">
              Sign In
            </span>
          </Link>
        </>
      )}
    </>
  );
}
