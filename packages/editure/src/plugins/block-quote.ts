import { Editor, Transforms, Range, Point } from 'tuture-slate';
import { BLOCK_QUOTE, PARAGRAPH } from 'editure-constants';

import { toggleBlock, isBlockActive } from '../helpers';
import { getLineText, getBeforeText } from '../utils';
import { detectShortcut } from '../shortcuts';

const shortcutRegexes = [/^\s*>$/];

export default function withBlockquote(editor: Editor) {
  const { insertText, insertBreak, deleteBackward } = editor;

  editor.insertText = text => {
    const { selection } = editor;

    if (text === ' ' && selection && Range.isCollapsed(selection)) {
      const matchArr = detectShortcut(editor, shortcutRegexes);

      if (matchArr) {
        Transforms.select(editor, getBeforeText(editor).range!);
        Transforms.delete(editor);

        const nodeProp = { type: BLOCK_QUOTE };
        return toggleBlock(editor, BLOCK_QUOTE, nodeProp);
      }

      return insertText(' ');
    }

    insertText(text);
  };

  editor.insertBreak = () => {
    if (isBlockActive(editor, BLOCK_QUOTE)) {
      const { wholeLineText } = getLineText(editor);

      if (!wholeLineText) {
        // Exit the blockquote if last line is empty.
        toggleBlock(editor, BLOCK_QUOTE, {}, { exit: true });
      } else {
        insertBreak();
      }

      return;
    }

    insertBreak();
  };

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: n => n.type === BLOCK_QUOTE
      });

      if (match) {
        const [block, path] = match;
        const start = Editor.start(editor, path);

        if (
          block.type !== PARAGRAPH &&
          Point.equals(selection.anchor, start) &&
          isBlockActive(editor, PARAGRAPH)
        ) {
          const block = Editor.above(editor, {
            match: n => n.type === BLOCK_QUOTE
          });

          if (block) {
            const [node] = block;

            const { wholeLineText } = getLineText(editor);
            const { children = [] } = node;

            Editor.withoutNormalizing(editor, () => {
              if (children.length === 1 && !wholeLineText) {
                toggleBlock(editor, BLOCK_QUOTE, {}, { unwrap: true });
              } else if (children.length > 1) {
                Transforms.mergeNodes(editor);
              }
            });
          }

          return;
        }
      }

      deleteBackward(...args);
    }
  };

  return editor;
}
