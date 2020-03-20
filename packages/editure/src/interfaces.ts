import { Editor } from 'tuture-slate';

export interface EditorWithMark extends Editor {
  isMarkActive(format: string): boolean;
  toggleMark(format: string): void;
}

export interface EditorWithBlock extends Editor {
  isBlockActive(format: string): boolean;
  toggleBlock(format: string, props?: any): void;
  detectBlockFormat(formats: string[]): string | null;
}
