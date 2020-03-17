import { Editor, Transforms, Range, Point } from 'tuture-slate';
import { BLOCK_QUOTE, PARAGRAPH } from 'editure-constants';

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

    const match = Editor.above(e, {
      match: n => n.type === BLOCK_QUOTE
    });

    if (match) {
      const [block, path] = match;
      const start = Editor.start(e, path);

      if (
        block.type !== PARAGRAPH &&
        Point.equals(selection.anchor, start) &&
        e.isBlockActive(e.getChildFormat(BLOCK_QUOTE))
      ) {
        const { wholeLineText } = getLineText(e);
        const { children = [] } = block;

        Editor.withoutNormalizing(e, () => {
          if (children.length === 1 && !wholeLineText) {
            e.toggleBlock(BLOCK_QUOTE);
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
