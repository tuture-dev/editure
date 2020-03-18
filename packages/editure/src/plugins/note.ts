import { Transforms, Editor, Range, Point } from 'tuture-slate';
import { NOTE, PARAGRAPH } from 'editure-constants';

import { EditorWithContainer } from './base-container';
import { getBeforeText, getLineText } from '../utils';
import { detectShortcut } from '../shortcuts';

const shortcutRegexes = [/^\s*:::\s*([a-zA-Z]*)$/];

export const withNote = (editor: EditorWithContainer) => {
  const { getChildFormat, insertBreak, deleteBackward } = editor;

  editor.getChildFormat = format => {
    return format === NOTE ? PARAGRAPH : getChildFormat(format);
  };

  editor.insertBreak = () => {
    const { selection } = editor;

    if (!selection) return;

    if (Range.isCollapsed(selection)) {
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
    const { selection } = editor;

    if (!selection) return;

    if (unit !== 'character') {
      return deleteBackward(unit);
    }

    const match = Editor.above(editor, {
      match: n => n.type === NOTE
    });

    if (match) {
      const [block, path] = match;
      const start = Editor.start(editor, path);

      if (
        block.type !== PARAGRAPH &&
        Point.equals(selection.anchor, start) &&
        editor.isBlockActive(editor.getChildFormat(NOTE))
      ) {
        const { wholeLineText } = getLineText(editor);
        const { children = [] } = block;

        Editor.withoutNormalizing(editor, () => {
          if (children.length === 1 && !wholeLineText) {
            editor.toggleBlock(NOTE);
          } else if (children.length > 1) {
            Transforms.mergeNodes(editor);
          }
        });

        return;
      }

      return deleteBackward(unit);
    }

    deleteBackward(unit);
  };

  return editor;
};
