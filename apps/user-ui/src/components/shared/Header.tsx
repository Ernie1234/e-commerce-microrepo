'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Search, ShoppingCart } from 'lucide-react';
import HeaderBottom from './HeaderBottom';
import UserHeader from './UserHeader';

function Header() {
  return (
    // Replaced bg-slate-50 dark:bg-slate-900 with bg-background
    <header className="w-full bg-background">
      <div className="w-[80%] py-5 m-auto flex items-center justify-between">
        <div>
          <Link href="/">
            <span className="text-xl font-medium text-tertiary">
              E-Commerce Shop
            </span>
          </Link>
        </div>
        <div className="relative w-[50%]">
          <input
            type="text"
            placeholder="Search for products"
            className="w-full px-4 outline-none h-[40px] font-medium placeholder-text-placeholder border-[2px] border-tertiary dark:border-border bg-input dark:bg-input/30 focus:outline-none focus:border-tertiary dark:focus:border-focus transition-all duration-500 peer text-input-foreground"
          />
          <div
            // Replaced dark:bg-slate-800 with dark:bg-muted, and peer-focus:bg-slate-600 with peer-focus:bg-active
            className="w-[60px] cursor-pointer flex items-center justify-center h-[40px] bg-tertiary dark:bg-muted absolute top-0 right-0 peer-focus:bg-active"
          >
            {/* Replaced dark:text-slate-400 with dark:text-muted-foreground */}
            <Search className="dark:text-muted-foreground" />
          </div>
        </div>
        <div className="flex items-center gap-4 transition-all duration-500">
          <UserHeader />
          <div className="flex items-center gap-5">
            <Link href="/wishlist" className="relative group">
              <Heart className="dark:text-muted-foreground dark:group-hover:text-foreground transition-all duration-300" />
              <div className="bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px] w-6 h-6 border-white">
                <span className="text-white font-medium text-sm">0</span>
              </div>
            </Link>
            <Link href="/cart" className="relative group">
              <ShoppingCart className="dark:text-muted-foreground dark:group-hover:text-foreground transition-all duration-300" />
              <div className="bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px] w-6 h-6 border-white">
                <span className="text-white font-medium text-sm">0</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
      <div className="border-b border-b-border" />
      <HeaderBottom />
    </header>
  );
}

export default Header;
