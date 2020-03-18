import { Range } from 'tuture-slate';
import { ITALIC } from 'editure-constants';

import { EditorWithMark } from './base-mark';
import { detectShortcut, handleMarkShortcut } from '../shortcuts';

const shortcutRegexes = [/\*([^\*]+)\*/, /_([^_]+)_/];

export const withItalic = (editor: EditorWithMark) => {
  const { insertText } = editor;

  editor.insertText = text => {
    const { selection } = editor;

    if (text === ' ' && selection && Range.isCollapsed(selection)) {
      const matchArr = detectShortcut(editor, shortcutRegexes);

      if (matchArr) {
        handleMarkShortcut(editor, ITALIC, matchArr);
      }

      return insertText(' ');
    }

    insertText(text);
  };

  return editor;
};
