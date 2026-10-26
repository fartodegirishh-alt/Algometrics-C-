import { AlgorithmDefinition } from '../types/algorithm';
import { binarySearchDefinition } from './binarySearch';
import { bubbleSortDefinition } from './bubbleSort';
import { heapSortDefinition } from './heapSort';
import { insertionSortDefinition } from './insertionSort';
import { linearSearchDefinition } from './linearSearch';
import { mergeSortDefinition } from './mergeSort';
import { selectionSortDefinition } from './selectionSort';

export const ALGORITHMS: AlgorithmDefinition[] = [
  bubbleSortDefinition,
  selectionSortDefinition,
  insertionSortDefinition,
  mergeSortDefinition,
  heapSortDefinition,
  linearSearchDefinition,
  binarySearchDefinition,
];

export function getAlgorithmById(id: string): AlgorithmDefinition {
  const found = ALGORITHMS.find((algo) => algo.id === id);
  return found || bubbleSortDefinition;
}

export const SORTING_ALGORITHMS = ALGORITHMS.filter((a) => a.category === 'sorting');
export const SEARCHING_ALGORITHMS = ALGORITHMS.filter((a) => a.category === 'searching');
