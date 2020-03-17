import { Transforms, Editor, Range, Point } from 'tuture-slate';
import { NOTE, PARAGRAPH } from 'editure-constants';

import { withBaseContainer } from './base-container';
import { getBeforeText, getLineText } from '../utils';
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

    const match = Editor.above(e, {
      match: n => n.type === NOTE
    });

    if (match) {
      const [block, path] = match;
      const start = Editor.start(e, path);

      if (
        block.type !== PARAGRAPH &&
        Point.equals(selection.anchor, start) &&
        e.isBlockActive(e.getChildFormat(NOTE))
      ) {
        const { wholeLineText } = getLineText(e);
        const { children = [] } = block;

        Editor.withoutNormalizing(e, () => {
          if (children.length === 1 && !wholeLineText) {
            e.toggleBlock(NOTE);
          } else if (children.length > 1) {
            Transforms.mergeNodes(e);
          }
        });

        return;
      }

      return deleteBackward(unit);
    }

    deleteBackward(unit);
  };

  return e;
};
