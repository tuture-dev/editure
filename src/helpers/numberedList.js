import { Transforms, Editor } from "slate";

export const withNumberedLists = editor => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    if (isNumberedListActive(editor)) {
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
        toggleNumberedListElement(editor);
      } else {
        insertBreak();
      }

      return;
    }

    insertBreak();
  };

  return editor;
};

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
