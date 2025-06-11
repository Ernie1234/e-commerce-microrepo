import React from 'react';
import Link from 'next/link';
import { Heart, Search, ShoppingCart } from 'lucide-react';
import { FaRegUser } from 'react-icons/fa';
import HeaderBottom from './HeaderBottom';

function Header() {
  return (
    <header className="w-full bg-slate-100 dark:bg-slate-900">
      <div className="w-[80%] py-5 m-auto flex items-center justify-between">
        <div>
          <Link href="/">
            <span className="text-xl font-medium text-orange-500">
              E-Commerce Shop
            </span>
          </Link>
        </div>
        <div className="relative w-[50%]">
          <input
            type="text"
            placeholder="Search for products"
            className="w-full px-4 outline-none h-[40px] font-medium placeholder-shown:font-normal border-[2px] border-orange-500 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/30 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 dark:focus:border-slate-700 transition-all duration-500 peer dark:caret-slate-50 text-slate-50"
          />
          <div className="w-[60px] cursor-pointer flex items-center justify-center h-[40px] bg-orange-500 dark:bg-slate-800 absolute top-0 right-0 peer-focus:bg-slate-600">
            <Search className="dark:text-slate-400" />
          </div>
        </div>
        <div className="flex items-center gap-4 transition-all duration-500">
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="border-2 p-1 flex items-center justify-center rounded-full hover:bg-slate-200 hover:border-slate-500 group transition-all duration-500 dark:hover:bg-slate-500 dark:border-slate-400"
            >
              <FaRegUser className="group-hover:text-slate-500 transition-all duration-500 dark:text-slate-400 dark:group-hover:text-slate-200" />
            </Link>
          </div>
          <Link href="/login">
            <span className="block font-Poppins text-sm dark:text-slate-300">
              Hello,
            </span>
            <span className="font-semibold font-Poppins text-base dark:text-slate-200">
              Sign In
            </span>
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/wishlist" className="relative group">
              <Heart className="dark:text-slate-400 dark:group-hover:text-slate-200 transition-all duration-300" />
              <div className="bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px] w-6 h-6 border-white">
                <span className="text-white font-medium text-sm">0</span>
              </div>
            </Link>
            <Link href="/cart" className="relative group">
              <ShoppingCart className="dark:text-slate-400 dark:group-hover:text-slate-200 transition-all duration-300" />
              <div className="bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px] w-6 h-6 border-white">
                <span className="text-white font-medium text-sm">0</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
      <div className="border-b border-b-slate-300 dark:border-b-slate-800" />
      <HeaderBottom />
    </header>
  );
}

export default Header;
