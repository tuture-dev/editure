import { Transforms } from "slate";

import { isBlockActive } from "../blocks";

export default function withSoftBreak(editor) {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    if (isBlockActive(editor, "code-block") || isBlockActive(editor, "block-quote")) {
      Transforms.insertText(editor, "\n");
    } else {
      insertBreak();
    }
  };

  return editor;
}
