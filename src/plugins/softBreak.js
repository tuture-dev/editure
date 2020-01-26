import { Transforms } from "slate";

import { isBlockActive, toggleBlock } from "../blocks";
import { getBeforeText } from "../utils";
import { CODE_BLOCK, BLOCK_QUOTE } from "../constants";

export default function withSoftBreak(editor) {
  const { insertBreak, deleteBackward } = editor;

  editor.insertBreak = () => {
    if (isBlockActive(editor, BLOCK_QUOTE)) {
      const { beforeText } = getBeforeText(editor);

      if (!beforeText.split("\n").slice(-1)[0]) {
        // 如果最后一行为空，退出块状引用
        deleteBackward();
        insertBreak();
        toggleBlock(editor, BLOCK_QUOTE);
      } else {
        // 还是软换行
        Transforms.insertText(editor, "\n");
      }
    } else if (isBlockActive(editor, CODE_BLOCK)) {
      // 代码块始终软换行
      Transforms.insertText(editor, "\n");
    } else {
      insertBreak();
    }
  };

  return editor;
}
