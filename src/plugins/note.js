import { Transforms, Editor } from "slate";

import { NOTE, PARAGRAPH, TOOL_BUTTON, HOT_KEY, SHORT_CUTS } from "../constants";

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
  const [, path] = Editor.above(editor, {
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

    default: {
      return;
    }
  }
};
