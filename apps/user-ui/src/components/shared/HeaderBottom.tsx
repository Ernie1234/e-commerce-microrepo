'use client';

import { AlignLeft, ChevronDown, Heart, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { navItem } from '../../data/constants';
import { NavItemsTypes } from '../../types/global';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaRegUser } from 'react-icons/fa';

export default function HeaderBottom() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`w-full transition-all shadow-lg duration-500 ${
        isSticky
          ? 'fixed top-0 left-0 z-[100] bg-slate-50 dark:bg-slate-900 justify-center'
          : 'relative'
      }`}
    >
      <div
        className={`w-[80%] relative m-auto flex items-center justify-between ${
          isSticky ? 'pb-2' : 'py-0'
        }`}
      >
        {/* ALL DROPDOWNS */}
        <div
          className={`w-[260px] ${
            isSticky && '-mb-2'
          } cursor-pointer flex items-center justify-between px-5 h-[50px] bg-orange-500`}
          onClick={() => setShow(!show)}
        >
          <div className="flex items-center gap-2">
            <AlignLeft color="white" />
            <span className="text-white font-medium">All Departments</span>
          </div>
          {/* ANIMATED CHEVRON */}
          <div
            className={`transition-transform duration-500 ${
              show ? 'rotate-180' : 'rotate-0'
            }`}
          >
            <ChevronDown color="white" />
          </div>
        </div>
        {/* DROPDOWN MENU */}
        {show && (
          <div
            className={`absolute shadow-lg left-0 ${
              isSticky ? 'top-[50px]' : 'top-[50px]'
            } w-[260px] h-[400px] bg-red-400`}
          ></div>
        )}

        {/* NAVIGATION LINKS */}
        <div className={`flex items-center ${isSticky && 'pt-2'}`}>
          {navItem.map((item: NavItemsTypes, index: number) => (
            <Link
              key={index}
              className={`px-5 text-lg transition-all duration-500
                ${
                  pathname === item.href
                    ? 'text-slate-500 dark:text-slate-500' // Active link
                    : 'text-gray-700 hover:text-orange-400 dark:text-slate-200 dark:hover:text-slate-400' // Default + hover
                }
              `}
              href={item.href}
            >
              {item.title}
            </Link>
          ))}
        </div>

        {/*  */}
        {isSticky && (
          <div
            className={`flex items-center justify-center gap-4 transition-all duration-500 ${
              isSticky && 'pt-2'
            }`}
          >
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="border-2 p-1 flex items-center justify-center rounded-full hover:bg-slate-200 hover:border-slate-500 group transition-all duration-500 dark:hover:bg-slate-500 dark:border-slate-400"
              >
                <FaRegUser className="group-hover:text-slate-500 transition-all duration-500 dark:text-slate-400 dark:group-hover:text-slate-200" />
              </Link>
              <span className="font-semibold font-Poppins text-base dark:text-slate-200">
                Sign In
              </span>
            </div>

            <div
              className={`flex items-center justify-center gap-5 ${
                isSticky && 'mt-0'
              }`}
            >
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
        )}
      </div>
    </div>
  );
}
// 07084830495
