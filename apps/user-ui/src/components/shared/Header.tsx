import React from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { FaRegUser } from 'react-icons/fa';

function Header() {
  return (
    <header className="w-full bg-gray-100">
      <div className="w-[80%] py-5 m-auto flex items-center justify-between">
        <div>
          <Link href="/">
            <span className="text-xl font-medium text-purple-500">
              E-Commerce Shop
            </span>
          </Link>
        </div>
        <div className="relative w-[50%]">
          <input
            type="text"
            placeholder="Search for products"
            className="w-full px-4 outline-none h-[40px] font-medium placeholder-shown:font-normal border-[2px] border-purple-500 bg-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-all duration-500"
          />
          <div className="w-[60px] cursor-pointer flex items-center justify-center h-[40px] bg-purple-500 absolute top-0 right-0">
            <Search />
          </div>
        </div>
        <div className="flex items-center gap-4 transition-all duration-500">
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="border-2 p-1 flex items-center justify-center rounded-full hover:bg-slate-200 hover:border-slate-500 group transition-all duration-500"
            >
              <FaRegUser className="group-hover:text-slate-500 transition-all duration-500" />
            </Link>
          </div>
          <Link href="/login">
            <span className="block font-Poppins text-sm">Hello,</span>
            <span className="font-semibold font-Poppins text-base">
              Sign In
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
