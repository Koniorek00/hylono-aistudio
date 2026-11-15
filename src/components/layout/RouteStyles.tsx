'use client';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

export const SharedStyles = dynamic(() => import('./SharedStyles'));

export function RouteStyles() {
  return usePathname() === '/' ? null : <SharedStyles />;
}
