import { Transforms, Editor, Range, Point } from 'tuture-slate';
import { NOTE, PARAGRAPH } from 'editure-constants';

import { isBlockActive, toggleBlock } from '../helpers';
import { getBeforeText, getLineText } from '../utils';
import { detectShortcut } from '../shortcuts';

const shortcutRegexes = [/^\s*:::\s*([a-zA-Z]*)$/];

export default function withNote(editor: Editor) {
  const { insertBreak, deleteBackward } = editor;

  editor.insertBreak = () => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const matchArr = detectShortcut(editor, shortcutRegexes);

      if (matchArr) {
        if (isBlockActive(editor, NOTE)) {
          // Already in a note block.
          return insertBreak();
        }

        Transforms.select(editor, getBeforeText(editor).range!);
        Transforms.delete(editor);

        const nodeProp = { type: NOTE, level: matchArr[1] };
        return toggleBlock(editor, NOTE, nodeProp);
      }

      return insertBreak();
    }

    insertBreak();
  };

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: n => n.type === NOTE
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
            match: n => n.type === NOTE
          });

          if (block) {
            const [node] = block;

            const { wholeLineText } = getLineText(editor);
            const { children = [] } = node;

            Editor.withoutNormalizing(editor, () => {
              if (children.length === 1 && !wholeLineText) {
                toggleBlock(editor, NOTE, {}, { unwrap: true });
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
