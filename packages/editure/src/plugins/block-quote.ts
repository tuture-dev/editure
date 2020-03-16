import { Editor, Transforms, Range } from 'tuture-slate';
import { BLOCK_QUOTE } from 'editure-constants';

import { withBaseContainer } from './base-container';
import { getLineText, getBeforeText } from '../utils';
import { detectShortcut } from '../shortcuts';

const shortcutRegexes = [/^\s*>$/];

export const withBlockquote = (editor: Editor) => {
  const e = withBaseContainer(editor);
  const { insertText, insertBreak, deleteBackward } = e;

  e.insertText = text => {
    const { selection } = e;

    if (text === ' ' && selection && Range.isCollapsed(selection)) {
      const matchArr = detectShortcut(e, shortcutRegexes);

      if (matchArr) {
        Transforms.select(e, getBeforeText(e).range!);
        Transforms.delete(e);

        return e.toggleBlock(BLOCK_QUOTE);
      }

      return insertText(' ');
    }

    insertText(text);
  };

  e.insertBreak = () => {
    if (e.isBlockActive(BLOCK_QUOTE)) {
      const { wholeLineText } = getLineText(e);

      if (!wholeLineText) {
        // Exit the blockquote if last line is empty.
        e.exitBlock(BLOCK_QUOTE);
      } else {
        insertBreak();
      }

      return;
    }

    insertBreak();
  };

  e.deleteBackward = unit => {
    const { selection } = e;

    if (!selection) return;

    if (unit !== 'character') {
      return deleteBackward(unit);
    }

    e.deleteByCharacter(BLOCK_QUOTE);
  };

  return e;
};
