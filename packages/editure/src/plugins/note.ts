import { Transforms, Editor, Range } from 'tuture-slate';
import { NOTE } from 'editure-constants';

import { withBaseContainer } from './base-container';
import { getBeforeText } from '../utils';
import { detectShortcut } from '../shortcuts';

const shortcutRegexes = [/^\s*:::\s*([a-zA-Z]*)$/];

export const withNote = (editor: Editor) => {
  const e = withBaseContainer(editor);
  const { insertBreak, deleteBackward } = e;

  e.insertBreak = () => {
    const { selection } = e;

    if (!selection) return;

    if (Range.isCollapsed(selection)) {
      const matchArr = detectShortcut(e, shortcutRegexes);

      if (matchArr) {
        if (e.isBlockActive(NOTE)) {
          // Already in a note block.
          return insertBreak();
        }

        Transforms.select(e, getBeforeText(e).range!);
        Transforms.delete(e);

        return e.toggleBlock(NOTE, { level: matchArr[1] });
      }

      return insertBreak();
    }

    insertBreak();
  };

  e.deleteBackward = unit => {
    const { selection } = e;

    if (!selection) return;

    if (unit !== 'character') {
      return deleteBackward(unit);
    }

    e.deleteByCharacter(NOTE);
  };

  return e;
};
