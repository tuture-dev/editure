import { Transforms, Editor, Text } from "slate";

export const isUnderlineMarkActive = editor => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === "underline",
    universal: true
  });

  return !!match;
};

export const toggleUnderlineMark = editor => {
  const isActive = isUnderlineMarkActive(editor);

  Transforms.setNodes(
    editor,
    { type: isActive ? null : "underline" },
    { match: n => Text.isText(n), split: true }
  );
};
