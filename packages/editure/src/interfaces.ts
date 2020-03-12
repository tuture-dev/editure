import { Editor } from 'tuture-slate';

export interface EditorWithMark extends Editor {
  isMarkActive(format: string): boolean;
  toggleMark(format: string): void;
}
