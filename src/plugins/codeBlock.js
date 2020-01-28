import { Transforms, Editor, Point, Range } from "slate";

import { CODE_BLOCK, CODE_LINE, PARAGRAPH } from "../constants";
import { isBlockActive } from "../blocks";

export const withCodeBlock = editor => {
  const { insertText, deleteBackward } = editor;

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: n => Editor.isBlock(editor, n)
      });

      if (match) {
        const [block, path] = match;
        const start = Editor.start(editor, path);

        if (
          block.type !== PARAGRAPH &&
          Point.equals(selection.anchor, start) &&
          isBlockActive(editor, CODE_LINE)
        ) {
          const [node, _] = Editor.above(editor, {
            match: n => n.type === CODE_BLOCK
          });

          const { children = [] } = node;

          if (children.length > 1) {
            Transforms.setNodes(
              editor,
              { type: PARAGRAPH },
              {
                match: n => n.type === CODE_LINE
              }
            );

            Transforms.removeNodes(editor, {
              match: n => n.children && !n.children[0].text
            });
          } else {
            Transforms.unwrapNodes(editor, {
              match: n => n.type === CODE_LINE
            });
            Transforms.setNodes(
              editor,
              {
                type: PARAGRAPH
              },
              { match: n => n.type === CODE_BLOCK }
            );
          }

          return;
        }
      }

      deleteBackward(...args);
    }
  };

  return editor;
};
