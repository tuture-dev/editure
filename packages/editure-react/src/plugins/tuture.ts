import { createEditor, defaultPlugins, withHistory, Transforms, Range, Editor } from 'editure';

export const withCommitHeaderLayout = (editor: Editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = ([node, path]) => {
    if (path.length === 1 && node.fixed) {
      if (node.type === 'paragraph') {
        const title = { type: 'heading-two', children: [{ text: '' }] };
        Transforms.setNodes(editor, title);
      }
    }

    return normalizeNode([node, path]);
  };

  return editor;
};

export const withExplainLayout = (editor: Editor) => {
  const { deleteBackward } = editor;

  editor.deleteBackward = (unit) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const parent = Editor.parent(editor, selection);
      const grandparent = Editor.parent(editor, parent[1]);

      // If selection is start of EXPLAIN, forbid to deleteBackward
      if (
        grandparent[0].type === 'explain' &&
        Editor.isStart(editor, selection.anchor, parent[1]) &&
        Editor.isStart(editor, selection.anchor, grandparent[1])
      ) {
        return;
      }
    }

    deleteBackward(unit);
  };

  return editor;
};

export const withDiffBlockVoid = (editor: Editor) => {
  const { isVoid } = editor;

  editor.isVoid = (element) => {
    return element.type === 'diff-block' ? true : isVoid(element);
  };

  return editor;
};
