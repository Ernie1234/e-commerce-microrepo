import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { Button } from './button';

export default function GoogleBtn() {
  return (
    <div className="w-full flex justify-center">
      <div className="cursor-pointer border flex items-center h-12">
        <FcGoogle />
        <Button />
      </div>
    </div>
  );
}
