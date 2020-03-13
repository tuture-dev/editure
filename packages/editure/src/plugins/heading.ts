import shortid from 'shortid';
import { Editor, Transforms, Range, Point } from 'tuture-slate';
import { H1, H2, H3, H4, H5, H6, PARAGRAPH } from 'editure-constants';

import { withBaseBlock } from './base-block';
import { getBeforeText } from '../utils';
import { detectShortcut } from '../shortcuts';

const shortcutRegexes: [string, RegExp[]][] = [
  [H1, [/^\s*#$/]],
  [H2, [/^\s*##$/]],
  [H3, [/^\s*###$/]],
  [H4, [/^\s*####$/]],
  [H5, [/^\s*#####$/]],
  [H6, [/^\s*######$/]]
];

export const withHeading = (editor: Editor) => {
  const e = withBaseBlock(editor);
  const { insertText, insertBreak, deleteBackward } = e;

  e.insertText = text => {
    const { selection } = e;

    if (text === ' ' && selection && Range.isCollapsed(selection)) {
      for (const [format, regexes] of shortcutRegexes) {
        const matchArr = detectShortcut(e, regexes);

        if (matchArr) {
          Transforms.select(e, getBeforeText(e).range!);
          Transforms.delete(e);

          return e.toggleBlock(format, { id: shortid.generate() });
        }
      }

      return insertText(' ');
    }

    insertText(text);
  };

  e.insertBreak = () => {
    insertBreak();

    [H1, H2, H3, H4, H5].forEach(format => {
      if (e.isBlockActive(format)) {
        e.toggleBlock(format);
      }
    });
  };

  e.deleteBackward = (...args) => {
    const { selection } = e;

    const match = Editor.above(e, {
      match: n => Editor.isBlock(e, n)
    });

    if (match) {
      const [block, path] = match;
      const start = Editor.start(e, path);

      if (
        block.type !== PARAGRAPH &&
        Point.equals(selection!.anchor, start) &&
        e.detectBlockFormat([H1, H2, H3, H4, H5, H6])
      ) {
        return Transforms.setNodes(e, { type: PARAGRAPH });
      }
    }

    deleteBackward(...args);
  };

  return e;
};
