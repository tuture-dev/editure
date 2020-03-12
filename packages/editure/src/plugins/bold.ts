import { Editor, Range } from 'tuture-slate';
import { BOLD } from 'editure-constants';

import { withBaseMark } from './base-mark';
import { detectShortcut, handleMarkShortcut } from '../shortcuts';

const shortcutRegexes = [/\*\*([^\*]+)\*\*/, /__([^_]+)__/];

export const withBold = (editor: Editor) => {
  const e = withBaseMark(editor);
  const { insertText } = e;

  e.insertText = text => {
    const { selection } = e;

    if (text === ' ' && selection && Range.isCollapsed(selection)) {
      const matchArr = detectShortcut(e, shortcutRegexes);

      if (matchArr) {
        handleMarkShortcut(e, BOLD, matchArr);
      }

      return insertText(' ');
    }

    insertText(text);
  };

  return e;
};
