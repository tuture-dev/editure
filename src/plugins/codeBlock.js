import { CODE_BLOCK } from "../constants";
import { isBlockActive } from "../blocks";

export default function withCodeBlock(editor) {
  const { insertText } = editor;

  editor.insertText = text => {
    if (text === "\n" && isBlockActive(editor, CODE_BLOCK)) {
    }
  };

  return editor;
}
