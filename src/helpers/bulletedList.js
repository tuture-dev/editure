import { Transforms, Editor } from "slate";

export const isBulletedListActive = editor => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === "bulleted-list"
  });

  return !!match;
};

export const toggleBulletedListElement = editor => {
  const isActive = isBulletedListActive(editor);

  Transforms.unwrapNodes(editor, {
    match: n => n.type === "bulleted-list",
    split: true
  });

  Transforms.setNodes(editor, {
    type: isActive ? null : "list-item"
  });

  if (!isActive) {
    const block = { type: "bulleted-list", children: [] };
    Transforms.wrapNodes(editor, block);
  }
};
