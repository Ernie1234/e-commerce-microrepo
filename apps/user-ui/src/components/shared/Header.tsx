import Link from 'next/link';
import React from 'react';

function Header() {
  return (
    <header className="w-full bg-white">
      <div className="w-[80%] py-5 m-auto flex items-center justify-between">
        <div>
          <Link href="/">
            <span className="text-xl font-medium text-red-500">
              E-Commerce Shop
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
