import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { ShinyButton } from './ShinyButton';

export default function GoogleBtn() {
  return (
    <div className="w-full flex justify-center">
      <ShinyButton>
        <div className="flex items-center gap-2">
          <FcGoogle size={20} />
          <span className="text-xs opacity-80 font-Poppins">
            Continue with Google
          </span>
        </div>
      </ShinyButton>
    </div>
  );
}
