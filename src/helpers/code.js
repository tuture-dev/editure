import { Transforms, Editor, Text } from "slate";

export const isCodeMarkActive = editor => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === "code",
    universal: true
  });

  return !!match;
};

export const toggleCodeMark = editor => {
  const isActive = isCodeMarkActive(editor);

  Transforms.setNodes(
    editor,
    { type: isActive ? null : "code" },
    { match: n => Text.isText(n), split: true }
  );
};
