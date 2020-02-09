import { Editor, Transforms, Range } from "slate";
import * as F from "editure-constants";

import { isBlockActive } from "./block";

export const MARK_TYPES = [
  F.BOLD,
  F.ITALIC,
  F.UNDERLINE,
  F.STRIKETHROUGH,
  F.CODE,
  F.LINK
];

export const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

export const detectMarkFormat = (editor, marks = MARK_TYPES) => {
  let realMarks = [];

  for (const mark of marks) {
    if (isMarkActive(editor, mark)) {
      realMarks.push(mark);
    }
  }

  return realMarks;
};

export const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isBlockActive(editor, F.CODE_BLOCK)) {
    return;
  }

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }

  const { selection, children } = editor;

  // Fix issue (from slate) of deleting first line.
  if (
    selection &&
    Range.isCollapsed(selection) &&
    children.length === 1 &&
    !children[0].children[0].text
  ) {
    Transforms.insertNodes(editor, {
      type: F.PARAGRAPH,
      children: [{ text: "" }]
    });
  }
};
