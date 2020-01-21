import { Transforms, Editor } from "slate";

export const withHr = editor => {
  const { isVoid } = editor;

  editor.isVoid = element => {
    return element.type === "hr" ? true : isVoid(element);
  };

  return editor;
};

export const insertHr = editor => {
  const text = "";
  const hr = { type: "hr", children: [{ text }] };
  Transforms.insertNodes(editor, hr);
};

export const removeHr = editor => {
  Transforms.removeNodes(editor, { match: n => n.type === "hr" });
};
