import { Editor, Transforms, Range, Point } from 'tuture-slate';
import { BLOCK_QUOTE, PARAGRAPH } from 'editure-constants';

import { EditorWithContainer } from './base-container';
import { getLineText, getBeforeText } from '../utils';
import { detectShortcut } from '../shortcuts';

const shortcutRegexes = [/^\s*>$/];

export const withBlockquote = (editor: EditorWithContainer) => {
  const { getChildFormat, insertText, insertBreak, deleteBackward } = editor;

  editor.getChildFormat = format => {
    return format === BLOCK_QUOTE ? PARAGRAPH : getChildFormat(format);
  };

  editor.insertText = text => {
    const { selection } = editor;

    if (text === ' ' && selection && Range.isCollapsed(selection)) {
      const matchArr = detectShortcut(editor, shortcutRegexes);

      if (matchArr) {
        Transforms.select(editor, getBeforeText(editor).range!);
        Transforms.delete(editor);

        return editor.toggleBlock(BLOCK_QUOTE);
      }

      return insertText(' ');
    }

    insertText(text);
  };

  editor.insertBreak = () => {
    if (editor.isBlockActive(BLOCK_QUOTE)) {
      const { wholeLineText } = getLineText(editor);

      if (!wholeLineText) {
        // Exit the blockquote if last line is empty.
        editor.exitBlock(BLOCK_QUOTE);
      } else {
        insertBreak();
      }

      return;
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
      match: n => n.type === BLOCK_QUOTE
    });

    if (match) {
      const [block, path] = match;
      const start = Editor.start(editor, path);

      if (
        block.type !== PARAGRAPH &&
        Point.equals(selection.anchor, start) &&
        editor.isBlockActive(editor.getChildFormat(BLOCK_QUOTE))
      ) {
        const { wholeLineText } = getLineText(editor);
        const { children = [] } = block;

        Editor.withoutNormalizing(editor, () => {
          if (children.length === 1 && !wholeLineText) {
            editor.toggleBlock(BLOCK_QUOTE);
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
