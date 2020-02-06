import { Transforms, Editor, Point, Range, Element, Node } from "slate";

import { isBlockActive } from "../blocks";
import { LIST_ITEM, BULLETED_LIST, NUMBERED_LIST, PARAGRAPH } from "../constants";

export const increaseItemDepth = editor => {
  const [node] = Editor.above(editor, {
    match: n => n.type === LIST_ITEM
  });
  const { level = 0, parent } = node;

  Transforms.setNodes(
    editor,
    {
      parent,
      level: Math.min(level + 1, 8)
    },
    {
      match: n => n.type === LIST_ITEM
    }
  );
};

export const decreaseItemDepth = editor => {
  const [node] = Editor.above(editor, {
    match: n => n.type === LIST_ITEM
  });
  const { level = 0, parent } = node;

  Transforms.setNodes(
    editor,
    {
      parent,
      level: Math.max(level - 1, 0)
    },
    {
      match: n => n.type === LIST_ITEM
    }
  );
};

export const withList = editor => {
  const { deleteBackward, normalizeNode } = editor;

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: n => n.type === LIST_ITEM
      });

      if (match) {
        const [block, path] = match;
        const start = Editor.start(editor, path);

        const parentAbove = Editor.above(editor, {
          match: n => n.type === BULLETED_LIST || n.type === NUMBERED_LIST
        });

        if (
          block.type !== PARAGRAPH &&
          Point.equals(selection.anchor, start) &&
          parentAbove
        ) {
          const type = isBlockActive(editor, BULLETED_LIST)
            ? BULLETED_LIST
            : NUMBERED_LIST;

          const [node, _] = Editor.above(editor, {
            match: n => n.type === type
          });

          const { level = 0 } = node;

          if (level === 0) {
            Transforms.liftNodes(editor, {
              match: n => n.type === LIST_ITEM
            });

            Transforms.setNodes(editor, { type: PARAGRAPH });
          } else {
            decreaseItemDepth(editor);
          }

          return;
        } else if (block.type !== PARAGRAPH && Point.equals(selection.anchor, start)) {
          Transforms.setNodes(editor, { type: PARAGRAPH });
        }
      }

      deleteBackward(...args);
    }
  };

  editor.normalizeNode = entry => {
    const [node, path] = entry;

    // If the element is a numbered-list, ensure each item has correct number.
    if (Element.isElement(node) && node.type === NUMBERED_LIST) {
      const counterStack = [];
      let counter = 0;
      let lastLevel = 0;

      for (const [child, childPath] of Node.children(editor, path)) {
        const { level = 0 } = child;
        if (level === lastLevel + 1) {
          counterStack.push(counter);
          counter = 1;
        } else if (level === lastLevel - 1) {
          counter = counterStack.pop() + 1;
        } else {
          counter++;
        }

        // Update item level and number.
        Transforms.setNodes(editor, { level, number: counter }, { at: childPath });

        lastLevel = level;
      }
    }

    // Fall back to the original `normalizeNode` to enforce other constraints.
    normalizeNode(entry);
  };

  return editor;
};
