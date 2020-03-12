import { Editor, Transforms, Range } from 'tuture-slate';
import * as F from 'editure-constants';

import { EditorWithMark } from '../interfaces';

const isMarkActive = (editor: Editor, format: string) => {
  try {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
  } catch {
    return false;
  }
};

export const withBaseMark = <T extends Editor>(editor: T) => {
  const e = editor as T & EditorWithMark;

  e.isMarkActive = (format: string) => {
    return isMarkActive(e, format);
  };

  e.toggleMark = (format: string) => {
    const isActive = isMarkActive(editor, format);

    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }

    const { selection, children } = editor;

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
