import { Transforms, Editor } from "slate";
import { LIST_ITEM } from "../constants";

export const increaseItemDepth = editor => {
  const [node] = Editor.above(editor, {
    match: n => n.type === LIST_ITEM
  });
  const { level = 0, parent } = node;

  Transforms.setNodes(
    editor,
    { parent, level: Math.min(level + 1, 8) },
    { match: n => n.type === LIST_ITEM }
  );
};

export const decreaseItemDepth = editor => {
  const [node] = Editor.above(editor, {
    match: n => n.type === LIST_ITEM
  });
  const { level = 0, parent } = node;

  Transforms.setNodes(
    editor,
    { parent, level: Math.max(level - 1, 0) },
    { match: n => n.type === LIST_ITEM }
  );
};
