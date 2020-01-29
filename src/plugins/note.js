import { Transforms, Editor, Point, Range } from "slate";

import { NOTE, PARAGRAPH, TOOL_BUTTON, HOT_KEY, SHORT_CUTS } from "../constants";
import { isBlockActive, toggleBlock } from "../blocks";
import { getLineText } from "../utils";

export const wrapNote = (editor, props) => {
  const text = { text: "" };
  const noteLineNode = { type: PARAGRAPH, children: [text] };
  const node = { type: NOTE, ...props, children: [text] };

  Transforms.setNodes(editor, noteLineNode);
  Transforms.wrapNodes(editor, node, {
    match: n => n.type === PARAGRAPH
  });
};

export const unwrapNote = editor => {
  Transforms.unwrapNodes(editor, {
    match: n => n.type === NOTE
  });
};

export const exitNote = editor => {
  const [_, path] = Editor.above(editor, {
    match: n => n.type === PARAGRAPH
  });

  const start = Editor.start(editor, path);
  const end = Editor.end(editor, path);

  const range = { anchor: start, focus: end };

  Transforms.unwrapNodes(editor, {
    at: range,
    match: n => n.type === NOTE,
    split: true
  });
};

export const handleActiveNote = (editor, type) => {
  switch (type) {
    case TOOL_BUTTON: {
      unwrapNote(editor);
      break;
    }

    case SHORT_CUTS: {
      exitNote(editor);
      break;
    }

    case HOT_KEY: {
      unwrapNote(editor);
      break;
    }
  }
};

export const withNote = editor => {
  const { deleteBackward, insertBreak } = editor;

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: n => Editor.isBlock(editor, n)
      });

      if (match) {
        const [block, path] = match;
        const start = Editor.start(editor, path);

        if (
          block.type !== PARAGRAPH &&
          Point.equals(selection.anchor, start) &&
          isBlockActive(editor, NOTE)
        ) {
          const [node, path] = Editor.above(editor, {
            match: n => n.type === NOTE
          });

          const { wholeLineText } = getLineText(editor);
          const { children = [] } = node;

          if (children.length === 1 && !wholeLineText) {
            unwrapNote(editor);
            return;
          } else if (children.length === 1 && wholeLineText) {
            return;
          } else if (children.length > 1) {
            Transforms.mergeNodes(editor);
            return;
          }
        }
      }

      deleteBackward(...args);
    }
  };

  return editor;
};
