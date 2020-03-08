import { Editor } from 'tuture-slate';
import {
  BLOCK_QUOTE,
  CODE_BLOCK,
  NOTE,
  BULLETED_LIST,
  NUMBERED_LIST
} from 'editure-constants';
import { toggleBlock, detectBlockFormat } from '../helpers';
import { getLineText } from '../utils';

export default function withBlockquote(editor: Editor) {
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
        // Exit the blockquote if last line is empty.
        toggleBlock(editor, BLOCK_QUOTE, {}, { exit: true });
      } else {
        insertBreak();
      }

      return;
    }

    insertBreak();
  };

  return editor;
}
