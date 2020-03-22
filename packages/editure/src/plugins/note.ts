import { Transforms, Editor, Range, Point } from 'tuture-slate';
import { NOTE, PARAGRAPH } from 'editure-constants';

import { EditorWithContainer } from './base-container';
import { getBeforeText, getLineText } from '../utils';
import { detectShortcut } from '../shortcuts';

const shortcutRegexes = [/^\s*:::\s*([a-zA-Z]*)$/];

export const withNote = (editor: EditorWithContainer) => {
  const { getChildFormat, insertBreak, deleteBackward, toggleBlock } = editor;

  editor.getChildFormat = format => {
    return format === NOTE ? PARAGRAPH : getChildFormat(format);
  };

  editor.insertBreak = () => {
    if (Range.isCollapsed(editor.selection!)) {
      const matchArr = detectShortcut(editor, shortcutRegexes);

      if (matchArr) {
        if (editor.isBlockActive(NOTE)) {
          // Already in a note block.
          return insertBreak();
        }

        Transforms.select(editor, getBeforeText(editor).range!);
        Transforms.delete(editor);

        return editor.toggleBlock(NOTE, { level: matchArr[1] });
      }

      return insertBreak();
    }

    insertBreak();
  };

  editor.deleteBackward = unit => {
    if (unit !== 'character') {
      return deleteBackward(unit);
    }

    const match = Editor.above(editor, {
      match: n => n.type === NOTE
    });

    if (match) {
      const { beforeText } = getBeforeText(editor);

      if (beforeText) {
        return deleteBackward('character');
      }

      const [block] = match;
      const { wholeLineText } = getLineText(editor);
      const { children } = block;

      if (children.length === 1 && !wholeLineText) {
        editor.toggleBlock(NOTE);
      } else {
        Transforms.mergeNodes(editor);
      }

      return;
    }

    deleteBackward(unit);
  };

  editor.toggleBlock = (format, props?) => {
    if (format !== NOTE) {
      return toggleBlock(format, props);
    }

    if (editor.isBlockActive(format)) {
      editor.unwrapBlock(format);
    } else {
      editor.wrapBlock(format, props);
    }
  };

  return editor;
};
