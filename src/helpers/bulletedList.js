import { Transforms, Editor } from "slate";

export const withBulletedLists = editor => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    if (isBulletedListActive(editor)) {
      const { anchor } = editor.selection;
      const match = Editor.above(editor, {
        match: n => Editor.isBlock(editor, n)
      });

      const path = match ? match[1] : [];
      const start = Editor.start(editor, path);
      const range = { anchor, focus: start };
      const beforeText = Editor.string(editor, range);

      // 如果为空，退出无序列表
      if (!beforeText) {
        toggleBulletedListElement(editor);
      } else {
        insertBreak();
      }

      return;
    }

    insertBreak();
  };

  return editor;
};

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
