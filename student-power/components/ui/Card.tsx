'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  hover?: boolean;
}

export default function Card({ 
  children, 
  onClick, 
  className = '',
  hover = true 
}: CardProps) {
  const baseStyle = 'bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-all duration-200';
  const hoverStyle = hover ? 'hover:shadow-xl hover:scale-105 cursor-pointer' : '';
  const clickStyle = onClick ? 'cursor-pointer' : '';
  
  return (
    <div
      onClick={onClick}
      className={`${baseStyle} ${hoverStyle} ${clickStyle} ${className}`}
    >
      {children}
    </div>
  );
}
