import { Transforms, Editor } from "slate";

export const isBlockquoteActive = editor => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === "block-quote"
  });

  return !!match;
};

export const toggleBlockquoteElement = editor => {
  const isActive = isBlockquoteActive(editor);

  Transforms.setNodes(
    editor,
    {
      type: isActive ? null : "block-quote"
    },
    {
      match: n => Editor.isBlock(editor, n)
    }
  );
};
