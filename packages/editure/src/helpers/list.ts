import { Transforms, Editor } from 'tuture-slate';
import { LIST_ITEM } from 'editure-constants';

export const increaseItemDepth = (editor: Editor) => {
  const block = Editor.above(editor, {
    match: n => n.type === LIST_ITEM
  });

  if (block) {
    const [node] = block;
    const { level = 0, parent } = node;

    Transforms.setNodes(
      editor,
      { parent, level: Math.min(level + 1, 8) },
      { match: n => n.type === LIST_ITEM }
    );
  }
};

export const decreaseItemDepth = (editor: Editor) => {
  const block = Editor.above(editor, {
    match: n => n.type === LIST_ITEM
  });

  if (block) {
    const [node] = block;
    const { level = 0, parent } = node;

    Transforms.setNodes(
      editor,
      { parent, level: Math.max(level - 1, 0) },
      { match: n => n.type === LIST_ITEM }
    );
  }
};
