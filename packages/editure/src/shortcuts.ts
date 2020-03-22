import { Editor, Transforms } from 'tuture-slate';

import { EditorWithMark } from './interfaces';
import { getBeforeText, getChildrenText } from './utils';

export function detectShortcut(editor: Editor, regexes: RegExp[]) {
  const { beforeText } = getBeforeText(editor);

  for (const regex of regexes) {
    if (beforeText && regex.test(beforeText)) {
      const matchArr = regex.exec(beforeText);

      // Matched at the end.
      if (matchArr && matchArr.index + matchArr[0].length === beforeText.length) {
        return matchArr;
      }
    }
  }

  return null;
}

export function handleMarkShortcut(
  editor: EditorWithMark,
  format: string,
  matchArr: RegExpExecArray
) {
  const { insertText, children } = editor;
  const { anchor } = editor.selection!;

  // Delete previous content with markdown syntax.
  const targetTextWithMdTag = matchArr[0];
  const childrenText = getChildrenText(children, anchor.path);
  const beforeText = childrenText.slice(0, editor.selection!.focus.offset);
  const deleteRangeStartOffset = beforeText.length - targetTextWithMdTag.length;
  const deleteRangeEndOffset = beforeText.length;

  const deleteRangeStart = { ...anchor, offset: deleteRangeStartOffset };
  const deleteRangeEnd = { ...anchor, offset: deleteRangeEndOffset };

  const deleteRange = { anchor: deleteRangeStart, focus: deleteRangeEnd };
  Transforms.select(editor, deleteRange);
  Transforms.delete(editor);

  // Insert nodes.
  const targetInsertText = matchArr[1];
  insertText(targetInsertText);

  // Mark inserted nodes.
  const needMarkRangeStartOffset = deleteRangeStartOffset;
  const needMarkRangeEndOffset = needMarkRangeStartOffset + targetInsertText.length;
  const needMarkRangeStart = {
    ...anchor,
    offset: needMarkRangeStartOffset
  };
  const needMarkRangeEnd = { ...anchor, offset: needMarkRangeEndOffset };

  const needMarkRange = {
    anchor: needMarkRangeStart,
    focus: needMarkRangeEnd
  };

  Transforms.select(editor, needMarkRange);
  editor.toggleMark(format);

  Transforms.collapse(editor, {
    edge: 'end'
  });

  // Remove marks and insert the space.
  editor.toggleMark(format);
}
