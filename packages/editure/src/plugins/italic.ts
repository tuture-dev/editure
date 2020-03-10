import { Editor, Range } from 'tuture-slate';
import { ITALIC } from 'editure-constants';

import { detectShortcut, handleMarkShortcut } from '../shortcuts';

const shortcutRegexes = [/\*([^\*]+)\*/, /_([^_]+)_/];

export default function withItalic(editor: Editor) {
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
}
