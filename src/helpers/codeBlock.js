import { Transforms, Editor } from "slate";

export const isCodeBlockActive = editor => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === "code-block"
  });

  return !!match;
};

export const toggleCodeBlockElement = editor => {
  const isActive = isCodeBlockActive(editor);

  Transforms.setNodes(
    editor,
    {
      type: isActive ? null : "code-block"
    },
    {
      match: n => Editor.isBlock(editor, n)
    }
  );
};
