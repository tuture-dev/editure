import { Range } from 'tuture-slate';
import { CODE } from 'editure-constants';

import { EditorWithMark } from './base-mark';
import { detectShortcut, handleMarkShortcut } from '../shortcuts';

const shortcutRegexes = [/`([^`]+)`/];

export const withInlineCode = (editor: EditorWithMark) => {
  const { insertText } = editor;

  editor.insertText = text => {
    const { selection } = editor;

    if (text === ' ' && selection && Range.isCollapsed(selection)) {
      const matchArr = detectShortcut(editor, shortcutRegexes);

      if (matchArr) {
        handleMarkShortcut(editor, CODE, matchArr);
      }

      return insertText(' ');
    }

    insertText(text);
  };

  return editor;
};
