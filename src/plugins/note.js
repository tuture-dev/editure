import { Transforms, Editor, Point, Range } from "slate";

import { NOTE, PARAGRAPH, TOOL_BUTTON, HOT_KEY, SHORT_CUTS } from "../constants";
import { isBlockActive } from "../blocks";
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
