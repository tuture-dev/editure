import { Transforms } from "slate";

import { isBlockActive } from "../blocks";
import { CODE_BLOCK, BLOCK_QUOTE } from "../constants";

export default function withSoftBreak(editor) {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    if (isBlockActive(editor, CODE_BLOCK) || isBlockActive(editor, BLOCK_QUOTE)) {
      Transforms.insertText(editor, "\n");
    } else {
      insertBreak();
    }
  };

  return editor;
}
