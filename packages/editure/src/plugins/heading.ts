import { Editor, Transforms, Range, Point } from 'tuture-slate';
import { H1, H2, H3, H4, H5, H6, PARAGRAPH } from 'editure-constants';

import { toggleBlock, detectBlockFormat } from '../helpers';
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

export default function withHeading(editor: Editor) {
  const { insertText, insertBreak, deleteBackward } = editor;

  editor.insertText = text => {
    const { selection } = editor;

    if (text === ' ' && selection && Range.isCollapsed(selection)) {
      for (const [format, regexes] of shortcutRegexes) {
        const matchArr = detectShortcut(editor, regexes);

        if (matchArr) {
          Transforms.select(editor, getBeforeText(editor).range!);
          Transforms.delete(editor);

          const nodeProp = { type: format };
          return toggleBlock(editor, format, nodeProp);
        }
      }

      return insertText(' ');
    }

    insertText(text);
  };

  editor.insertBreak = () => {
    insertBreak();

    // Toggle heading after inserting breaks.
    const headingFormat = detectBlockFormat(editor, [H1, H2, H3, H4, H5]);
    if (headingFormat) {
      toggleBlock(editor, headingFormat);
    }
  };

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    const match = Editor.above(editor, {
      match: n => Editor.isBlock(editor, n)
    });

    if (match) {
      const [block, path] = match;
      const start = Editor.start(editor, path);

      if (
        block.type !== PARAGRAPH &&
        Point.equals(selection!.anchor, start) &&
        detectBlockFormat(editor, [H1, H2, H3, H4, H5, H6])
      ) {
        return Transforms.setNodes(editor, { type: PARAGRAPH });
      }
    }

    deleteBackward(...args);
  };

  return editor;
}
