export interface CompilationTarget {
  id: string;
  name: string;
  description: string;
  languages: string[];
  isPremium: boolean;
}

export const COMPILATION_TARGETS: CompilationTarget[] = [
  {
    id: 'x86',
    name: 'x86 (32-bit)',
    description: 'Intel/AMD 32-bit architecture',
    languages: ['c', 'cpp', 'asm'],
    isPremium: false,
  },
  {
    id: 'arm',
    name: 'ARM',
    description: 'ARM Cortex processors',
    languages: ['c', 'cpp', 'asm'],
    isPremium: false,
  },
  {
    id: 'avr',
    name: 'AVR (Arduino)',
    description: 'Arduino and AVR microcontrollers',
    languages: ['c', 'cpp'],
    isPremium: false,
  },
  {
    id: 'z80',
    name: 'Z80',
    description: 'Classic Z80 processor (Game Boy, MSX)',
    languages: ['c', 'asm'],
    isPremium: true,
  },
  {
    id: 'mos6502',
    name: '6502',
    description: 'MOS 6502 (NES, Commodore 64)',
    languages: ['c', 'asm'],
    isPremium: true,
  },
  {
    id: 'gameboy',
    name: 'Game Boy',
    description: 'Nintendo Game Boy',
    languages: ['c', 'asm'],
    isPremium: true,
  },
  {
    id: 'nes',
    name: 'NES',
    description: 'Nintendo Entertainment System',
    languages: ['c', 'asm'],
    isPremium: true,
  },
  {
    id: 'riscv',
    name: 'RISC-V',
    description: 'Open-source RISC-V architecture',
    languages: ['c', 'cpp', 'asm'],
    isPremium: true,
  },
];

export const LANGUAGES = [
  { id: 'c', name: 'C', extension: '.c' },
  { id: 'cpp', name: 'C++', extension: '.cpp' },
  { id: 'asm', name: 'Assembly', extension: '.asm' },
];
