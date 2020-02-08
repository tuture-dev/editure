import { Editor, Transforms } from "slate";
import { getBeforeText } from "./utils";

export const insertVoid = (editor, format, props) => {
  const { beforeText } = getBeforeText(editor);

  if (beforeText) {
    Editor.insertBreak(editor);
  }

  Transforms.removeNodes(editor, {
    match: n => n.children && !n.children[0].text
  });

  const text = { text: "" };
  Transforms.insertNodes(editor, { type: format, ...props, children: [text] });
  Transforms.insertNodes(editor, { children: [text] });
};
