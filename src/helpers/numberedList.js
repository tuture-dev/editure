import { Transforms, Editor } from "slate";

export const isNumberedListActive = editor => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === "numbered-list"
  });

  return !!match;
};

export const toggleNumberedListElement = editor => {
  const isActive = isNumberedListActive(editor);

  Transforms.unwrapNodes(editor, {
    match: n => n.type === "numbered-list",
    split: true
  });

  Transforms.setNodes(editor, {
    type: isActive ? null : "list-item"
  });

  if (!isActive) {
    const block = { type: "numbered-list", children: [] };
    Transforms.wrapNodes(editor, block);
  }
};
