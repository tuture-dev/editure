import { Editor, Transforms, Element, Node } from 'tuture-slate';
import { PARAGRAPH } from 'editure-constants';

import { getBeforeText } from '../utils';

export const withParagraph = (editor: Editor) => {
  const { deleteBackward, normalizeNode } = editor;

  editor.deleteBackward = (unit) => {
    if (unit === 'line') {
      Transforms.select(editor, getBeforeText(editor).range!);
      Transforms.delete(editor);

      return;
    }

    deleteBackward(unit);
  };

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    if (!Element.isElement(node)) {
      return normalizeNode(entry);
    }

    const keys = Object.keys(node);

    // If a node is an element without any other keys, then it's a paragraph.
    if (keys.length === 1 && keys[0] === 'children') {
      Transforms.setNodes(editor, { type: PARAGRAPH }, { at: path });
    }

    // If the element is a paragraph, ensure it's children are valid.
    if (node.type === PARAGRAPH) {
      for (const [child, childPath] of Node.children(editor, path)) {
        if (Element.isElement(child) && !editor.isInline(child)) {
          Transforms.unwrapNodes(editor, { at: childPath });
          return;
        }
      }
    }

    normalizeNode(entry);
  };

  return editor;
};
