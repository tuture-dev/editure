import {
  BLOCK_QUOTE,
  CODE_BLOCK,
  NOTE,
  BULLETED_LIST,
  NUMBERED_LIST
} from "../constants";
import { toggleBlock, detectBlockFormat } from "../helpers";
import { getLineText } from "../helpers/utils";

export const withBlockquote = editor => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    const format = detectBlockFormat(editor, [
      CODE_BLOCK,
      NOTE,
      BLOCK_QUOTE,
      BULLETED_LIST,
      NUMBERED_LIST
    ]);

    if (format === BLOCK_QUOTE) {
      const { wholeLineText } = getLineText(editor);

      if (!wholeLineText) {
        // 如果最后一行为空，退出块状引用
        toggleBlock(editor, BLOCK_QUOTE, {}, { exit: true });
      } else {
        insertBreak();
      }

      return;
    }

    insertBreak();
  };

  return editor;
};
