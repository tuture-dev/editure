import { Transforms, Editor, Text } from "slate";

export const isItalicMarkActive = editor => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === "italic",
    universal: true
  });

  return !!match;
};

export const toggleItalicMark = editor => {
  const isActive = isItalicMarkActive(editor);

  Transforms.setNodes(
    editor,
    { type: isActive ? null : "italic" },
    { match: n => Text.isText(n), split: true }
  );
};
