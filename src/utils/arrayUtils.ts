import { InputDistribution } from '../types/algorithm';

export function generateArray(size: number, distribution: InputDistribution, maxValue: number = 99): number[] {
  let arr: number[] = [];
  const minVal = 5;

  switch (distribution) {
    case 'sorted':
      for (let i = 0; i < size; i++) {
        arr.push(Math.round(minVal + (i / Math.max(1, size - 1)) * (maxValue - minVal)));
      }
      break;

    case 'reversed':
      for (let i = 0; i < size; i++) {
        arr.push(Math.round(maxValue - (i / Math.max(1, size - 1)) * (maxValue - minVal)));
      }
      break;

    case 'nearly_sorted': {
      for (let i = 0; i < size; i++) {
        arr.push(Math.round(minVal + (i / Math.max(1, size - 1)) * (maxValue - minVal)));
      }
      // Swap ~10-15% of pairs
      const swaps = Math.max(1, Math.floor(size * 0.12));
      for (let s = 0; s < swaps; s++) {
        const i1 = Math.floor(Math.random() * size);
        const i2 = Math.min(size - 1, Math.max(0, i1 + (Math.random() > 0.5 ? 1 : -1)));
        const tmp = arr[i1];
        arr[i1] = arr[i2];
        arr[i2] = tmp;
      }
      break;
    }

    case 'few_unique': {
      const candidates = [12, 35, 68, 85];
      for (let i = 0; i < size; i++) {
        arr.push(candidates[i % candidates.length]);
      }
      // Shuffle slightly
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      break;
    }

    case 'random':
    default:
      for (let i = 0; i < size; i++) {
        arr.push(Math.floor(Math.random() * (maxValue - minVal + 1)) + minVal);
      }
      break;
  }

  return arr;
}

export function parseCustomArray(input: string): number[] | null {
  const parts = input.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return null;
  const numbers: number[] = [];
  for (const part of parts) {
    const n = Number(part);
    if (isNaN(n) || !Number.isInteger(n)) return null;
    numbers.push(Math.max(-999, Math.min(999, n)));
  }
  return numbers.length > 0 ? numbers : null;
}

export function formatNumber(num: number): string {
  if (Number.isInteger(num)) {
    return num.toLocaleString();
  }
  return num.toFixed(2);
}
