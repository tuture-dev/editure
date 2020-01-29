import { Editor } from "slate";

export const getBeforeText = editor => {
  const { anchor } = editor.selection;
  const match = Editor.above(editor, {
    match: n => Editor.isBlock(editor, n)
  });

  const path = match ? match[1] : [];
  const start = Editor.start(editor, path);
  const range = { anchor, focus: start };
  const beforeText = Editor.string(editor, range);

  return { beforeText, range };
};

export const getAfterText = editor => {
  const { anchor } = editor.selection;
  const match = Editor.above(editor, {
    match: n => Editor.isBlock(editor, n)
  });

  const path = match ? match[1] : [];
  const end = Editor.end(editor, path);
  const range = { anchor, focus: end };
  const afterText = Editor.string(editor, range);

  return { afterText, range };
};

export const getLineText = editor => {
  const match = Editor.above(editor, {
    match: n => Editor.isBlock(editor, n)
  });

  const path = match ? match[1] : [];
  const start = Editor.start(editor, path);
  const end = Editor.end(editor, path);
  const range = { anchor: start, focus: end };
  const wholeLineText = Editor.string(editor, range);

  return { wholeLineText, range };
};

export const getChildrenText = (children, path) => {
  console.log("children", children, path);
  let childrenItem = children;
  for (let i = 0; i < path.length - 1; i++) {
    console.log("i", i, childrenItem);
    childrenItem = childrenItem[path[i]].children;
  }

  return childrenItem[0].text;
};
