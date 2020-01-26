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
