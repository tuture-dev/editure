import { Editor, Transforms, Range } from 'tuture-slate';
import { BLOCK_QUOTE, PARAGRAPH } from 'editure-constants';

import { EditorWithContainer } from './base-container';
import { getLineText, getBeforeText } from '../utils';
import { detectShortcut } from '../shortcuts';

const shortcutRegexes = [/^\s*>$/];

export const withBlockquote = (editor: EditorWithContainer) => {
  const { getChildFormat, insertText, insertBreak, deleteBackward, toggleBlock } = editor;

  editor.getChildFormat = (format) => {
    return format === BLOCK_QUOTE ? PARAGRAPH : getChildFormat(format);
  };

  editor.insertText = (text) => {
    const { selection } = editor;

    if (text === ' ' && selection && Range.isCollapsed(selection)) {
      const matchArr = detectShortcut(editor, shortcutRegexes);

      if (matchArr && !editor.isBlockActive(BLOCK_QUOTE)) {
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
      const block = Editor.above(editor);
      const { wholeLineText } = getLineText(editor);

      if (!wholeLineText && block && block[0].type === PARAGRAPH) {
        // Exit the blockquote if last line is empty and is not in a list.
        editor.exitBlock(BLOCK_QUOTE);
      } else {
        insertBreak();
      }

      return;
    }

    insertBreak();
  };

  editor.deleteBackward = (unit) => {
    if (unit !== 'character') {
      return deleteBackward(unit);
    }

    const match = Editor.above(editor, {
      match: (n) => n.type === BLOCK_QUOTE,
    });

    if (match) {
      const { beforeText } = getBeforeText(editor);

      if (beforeText) {
        return deleteBackward('character');
      }

      const [block] = match;
      const { children = [] } = block;

      if (children.length === 1 && !beforeText) {
        editor.toggleBlock(BLOCK_QUOTE);
      } else if (children.length > 1) {
        Transforms.mergeNodes(editor);
      }

      return;
    }

    deleteBackward(unit);
  };

  editor.toggleBlock = (format, props?) => {
    if (format === BLOCK_QUOTE) {
      return Editor.withoutNormalizing(editor, () => {
        const isActive = editor.isBlockActive(format);

        if (isActive) {
          editor.unwrapBlock(format);
        } else {
          editor.wrapBlock(format, props);
        }
      });
    }

    toggleBlock(format, props);
  };

  return editor;
};
