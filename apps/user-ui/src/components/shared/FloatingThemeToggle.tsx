'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import {
  Sun,
  Moon,
  GripVertical,
  CornerDownRight,
  CornerUpLeft,
  CornerUpRight,
  CornerDownLeft,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

type Position = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

export function FloatingThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [currentPosition, setCurrentPosition] =
    useState<Position>('bottom-right');
  const [showPositionControls, setShowPositionControls] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component is mounted before accessing localStorage
  useEffect(() => {
    setIsMounted(true);
    const savedPosition = localStorage.getItem(
      'themeTogglePosition'
    ) as Position;
    if (savedPosition) setCurrentPosition(savedPosition);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('themeTogglePosition', currentPosition);
    }
  }, [currentPosition, isMounted]);

  const getPositionClasses = (position: Position) => {
    const baseClasses = 'fixed z-50 m-4';
    switch (position) {
      case 'bottom-right':
        return `${baseClasses} bottom-0 right-0`;
      case 'bottom-left':
        return `${baseClasses} bottom-0 left-0`;
      case 'top-right':
        return `${baseClasses} top-0 right-0`;
      case 'top-left':
        return `${baseClasses} top-0 left-0`;
      default:
        return `${baseClasses} bottom-0 right-0`;
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handlePositionChange = (newPosition: Position) => {
    setCurrentPosition(newPosition);
    setShowPositionControls(false);
  };

  if (!isMounted) return null;

  return (
    <div className={getPositionClasses(currentPosition)}>
      <div className="flex flex-col gap-2">
        {/* Position Controls */}
        {showPositionControls && (
          <div
            className={cn(
              'grid grid-cols-2 gap-2 p-2 rounded-lg bg-background/90 shadow-lg border',
              'animate-in fade-in-0 zoom-in-95',
              currentPosition.includes('bottom') ? 'mb-2' : 'mt-2',
              currentPosition.includes('right') ? 'mr-2' : 'ml-2'
            )}
          >
            {(
              [
                'top-left',
                'top-right',
                'bottom-left',
                'bottom-right',
              ] as Position[]
            ).map((pos) => (
              <Button
                key={pos}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handlePositionChange(pos)}
                aria-label={`Move to ${pos}`}
              >
                {pos === 'top-left' && <CornerUpLeft className="h-4 w-4" />}
                {pos === 'top-right' && <CornerUpRight className="h-4 w-4" />}
                {pos === 'bottom-left' && (
                  <CornerDownLeft className="h-4 w-4" />
                )}
                {pos === 'bottom-right' && (
                  <CornerDownRight className="h-4 w-4" />
                )}
              </Button>
            ))}
          </div>
        )}

        {/* Main Buttons */}
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full w-10 h-10 relative overflow-hidden shadow-md dark:bg-slate-900/30"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <Sun className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="rounded-full w-10 h-10 shadow-md  dark:bg-slate-900/30"
            onClick={() => setShowPositionControls(!showPositionControls)}
            aria-label="Change button position"
          >
            <GripVertical className="h-[1.2rem] w-[1.2rem]" />
          </Button>
        </div>
      </div>
    </div>
  );
}
