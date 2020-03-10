import { Editor, Range } from 'tuture-slate';
import { BOLD } from 'editure-constants';

import { detectShortcut, handleMarkShortcut } from '../shortcuts';

const shortcutRegexes = [/\*\*([^\*]+)\*\*/, /__([^_]+)__/];

export default function withBold(editor: Editor) {
  const { insertText } = editor;

  editor.insertText = text => {
    const { selection } = editor;

    if (text === ' ' && selection && Range.isCollapsed(selection)) {
      const matchArr = detectShortcut(editor, shortcutRegexes);

      if (matchArr) {
        handleMarkShortcut(editor, BOLD, matchArr);
      }

      return insertText(' ');
    }

    insertText(text);
  };

  return editor;
}
