import { Transforms, Editor, Text } from "slate";

export const isStrikethroughMarkActive = editor => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === "strikethrough",
    universal: true
  });

  return !!match;
};

export const toggleStrikethroughMark = editor => {
  const isActive = isStrikethroughMarkActive(editor);

  Transforms.setNodes(
    editor,
    { type: isActive ? null : "strikethrough" },
    { match: n => Text.isText(n), split: true }
  );
};
