import { Transforms, Editor } from "slate";

export const isHeadingActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format
  });

  return !!match;
};

export const toggleHeading = (editor, format) => {
  const isActive = isHeadingActive(editor, format);

  Transforms.setNodes(
    editor,
    {
      type: isActive ? null : format
    },
    {
      match: n => Editor.isBlock(editor, n)
    }
  );
};
