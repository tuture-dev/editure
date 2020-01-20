import { Transforms, Editor } from "slate";

export const isBlockquoteActive = editor => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === "blockquote"
  });

  return !!match;
};

export const toggleBlockquoteElement = editor => {
  const isActive = isBlockquoteActive(editor);

  Transforms.setNodes(
    editor,
    {
      type: isActive ? null : "blockquote"
    },
    {
      match: n => Editor.isBlock(editor, n)
    }
  );
};
