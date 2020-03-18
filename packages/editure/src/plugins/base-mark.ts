import { Editor, Transforms, Range } from 'tuture-slate';
import * as F from 'editure-constants';

import { Plugin } from '../interfaces';

export interface EditorWithMark extends Editor {
  isMarkActive(format: string): boolean;
  toggleMark(format: string): void;
}

export type MarkPlugin = Plugin<EditorWithMark, EditorWithMark>;

export const withBaseMark: Plugin<Editor, EditorWithMark> = editor => {
  const e = editor as EditorWithMark;

  e.isMarkActive = (format: string) => {
    try {
      const marks = Editor.marks(e);
      return marks ? marks[format] === true : false;
    } catch {
      return false;
    }
  };

  e.toggleMark = (format: string) => {
    const isActive = e.isMarkActive(format);

    if (isActive) {
      Editor.removeMark(e, format);
    } else {
      Editor.addMark(e, format, true);
    }

    const { selection, children } = e;

    // Fix issue (from slate) of deleting first line.
    if (
      selection &&
      Range.isCollapsed(selection) &&
      children.length === 1 &&
      !children[0].children[0].text
    ) {
      Transforms.insertNodes(editor, {
        type: F.PARAGRAPH,
        children: [{ text: '' }]
      });
    }
  };

  return e;
};
