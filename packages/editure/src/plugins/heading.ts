import shortid from 'shortid';
import { Editor, Transforms, Range, Point } from 'tuture-slate';
import { H1, H2, H3, H4, H5, H6, PARAGRAPH } from 'editure-constants';

import { EditorWithBlock } from './base-block';
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

export const withHeading = (editor: EditorWithBlock) => {
  const { insertText, insertBreak, deleteBackward } = editor;

  editor.insertText = text => {
    const { selection } = editor;

    if (text === ' ' && selection && Range.isCollapsed(selection)) {
      for (const [format, regexes] of shortcutRegexes) {
        const matchArr = detectShortcut(editor, regexes);

        if (matchArr) {
          Transforms.select(editor, getBeforeText(editor).range!);
          Transforms.delete(editor);

          return editor.toggleBlock(format, { id: shortid.generate() });
        }
      }

      return insertText(' ');
    }

    insertText(text);
  };

  editor.insertBreak = () => {
    insertBreak();

    [H1, H2, H3, H4, H5].forEach(format => {
      if (editor.isBlockActive(format)) {
        editor.toggleBlock(format);
      }
    });
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
        editor.detectBlockFormat([H1, H2, H3, H4, H5, H6])
      ) {
        return Transforms.setNodes(editor, { type: PARAGRAPH });
      }
    }

    deleteBackward(...args);
  };

  return editor;
};
