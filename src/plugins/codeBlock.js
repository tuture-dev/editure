import { Transforms, Editor, Point, Range, Element, Node } from "slate";

import { CODE_BLOCK, CODE_LINE, PARAGRAPH } from "../constants";
import { isBlockActive, unwrapBlock } from "../helpers";
import { getLineText } from "../helpers/utils";

export const withCodeBlock = editor => {
  const { deleteBackward, normalizeNode } = editor;

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: n => n.type === CODE_BLOCK
      });

      if (match) {
        const [block, path] = match;
        const start = Editor.start(editor, path);

        if (
          block.type !== PARAGRAPH &&
          Point.equals(selection.anchor, start) &&
          isBlockActive(editor, CODE_LINE)
        ) {
          const [node] = Editor.above(editor, {
            match: n => n.type === CODE_BLOCK
          });

          const { wholeLineText } = getLineText(editor);
          const { children = [] } = node;

          return Editor.withoutNormalizing(editor, () => {
            if (children.length === 1 && !wholeLineText) {
              unwrapBlock(editor, CODE_BLOCK);
            } else if (children.length > 1) {
              Transforms.mergeNodes(editor);
            }
          });
        }
      }

      deleteBackward(...args);
    }
  };

  editor.normalizeNode = entry => {
    const [node, path] = entry;

    if (Element.isElement(node) && node.type === CODE_BLOCK) {
      for (const [child, childPath] of Node.children(editor, path)) {
        if (Element.isElement(child) && child.type !== CODE_LINE) {
          Transforms.setNodes(editor, { type: CODE_LINE }, { at: childPath });
        }
      }
      return;
    }

    normalizeNode(entry);
  };

  return editor;
};
