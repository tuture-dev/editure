import { Transforms, Editor, Text } from "slate";

export const isLinkActive = editor => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === "link"
  });

  return !!match;
};

export const toggleLinkElement = editor => {
  const isActive = isLinkActive(editor);

  Transforms.setNodes(
    editor,
    {
      type: isActive ? null : "link"
    },
    {
      match: n => Text.isText(n),
      split: true
    }
  );
};
