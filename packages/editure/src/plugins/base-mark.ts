import { Editor, Transforms, Range } from 'tuture-slate';
import * as F from 'editure-constants';

export interface EditorWithMark extends Editor {
  isMarkActive(format: string): boolean;
  toggleMark(format: string): void;
}

export const withBaseMark = <T extends Editor>(editor: T) => {
  const e = editor as T & EditorWithMark;

  e.isMarkActive = (format: string) => {
    const marks = Editor.marks(e);
    return marks ? marks[format] === true : false;
  };

  e.toggleMark = (format: string) => {
    const isActive = e.isMarkActive(format);

    if (isActive) {
      Editor.removeMark(e, format);
    } else {
      Editor.addMark(e, format, true);
    }
  };

  return e;
};
