'use client';
import React from 'react';
import { Image as ImageIcon, Smartphone, FileText, type LucideIcon } from 'lucide-react';

export type CampaignFormatType = 'social-square' | 'social-story' | 'print-poster';
export interface FormatOption {
  id: CampaignFormatType;
  label: string;
  description: string;
  icon: LucideIcon;
  width: number;
  height: number;
}
export const OUTPUT_FORMATS: FormatOption[] = [
  { id: 'social-square', label: 'Feed post', description: '1080 x 1080 social square.', icon: ImageIcon, width: 1080, height: 1080 },
  { id: 'social-story', label: 'Story', description: '1080 x 1920 story vertical.', icon: Smartphone, width: 1080, height: 1920 },
  { id: 'print-poster', label: 'A4 poster', description: 'A4 layout for display.', icon: FileText, width: 900, height: 1273 },
];
