import { Transforms, Editor, Text } from "slate";

export const isBoldMarkActive = editor => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === "bold",
    universal: true
  });

  return !!match;
};

export const toggleBoldMark = editor => {
  const isActive = isBoldMarkActive(editor);

  Transforms.setNodes(
    editor,
    { type: isActive ? null : "bold" },
    { match: n => Text.isText(n), split: true }
  );
};
