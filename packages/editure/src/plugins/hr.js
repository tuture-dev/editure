import { HR } from "editure-constants";

export default function withHr(editor) {
  const { isVoid } = editor;

  editor.isVoid = element => {
    return element.type === HR ? true : isVoid(element);
  };

  return editor;
}
