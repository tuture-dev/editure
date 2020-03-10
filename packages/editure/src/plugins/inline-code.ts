import { Editor, Range } from 'tuture-slate';
import { CODE } from 'editure-constants';

import { detectShortcut, handleMarkShortcut } from '../shortcuts';

const shortcutRegexes = [/`([^`]+)`/];

export default function withInlineCode(editor: Editor) {
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
}
