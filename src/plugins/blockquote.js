import { Transforms, Editor, Range, Node, Point } from "slate";

import {
  BLOCK_QUOTE,
  PARAGRAPH,
  TOOL_BUTTON,
  HOT_KEY,
  SHORT_CUTS,
  CODE_BLOCK,
  NOTE
} from "../constants";
import { isBlockActive, toggleBlock, detectBlockFormat } from "../blocks";
import { getLineText } from "../utils";

export const wrapBlockquote = editor => {
  const text = { text: "" };
  const blockquoteLineNode = { type: PARAGRAPH, children: [text] };
  const node = { type: BLOCK_QUOTE, children: [text] };

  Transforms.setNodes(editor, blockquoteLineNode);
  Transforms.wrapNodes(editor, node, {
    match: n => n.type === PARAGRAPH
  });
};

export const unwrapBlockquote = editor => {
  Transforms.unwrapNodes(editor, {
    match: n => n.type === BLOCK_QUOTE
  });
};

export const exitBlockquote = editor => {
  const [_, path] = Editor.above(editor, {
    match: n => n.type === PARAGRAPH
  });

  const start = Editor.start(editor, path);
  const end = Editor.end(editor, path);

  const range = { anchor: start, focus: end };

  Transforms.unwrapNodes(editor, {
    at: range,
    match: n => n.type === BLOCK_QUOTE,
    split: true
  });
};

export const handleActiveBlockquote = (editor, type) => {
  switch (type) {
    case TOOL_BUTTON: {
      unwrapBlockquote(editor);
      break;
    }

    case SHORT_CUTS: {
      exitBlockquote(editor);
      break;
    }

    case HOT_KEY: {
      unwrapBlockquote(editor);
      break;
    }
  }
};

export const withBlockquote = editor => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    if (isBlockActive(editor, BLOCK_QUOTE)) {
      const { wholeLineText } = getLineText(editor);

      if (!wholeLineText) {
        // 如果最后一行为空，退出块状引用
        toggleBlock(editor, BLOCK_QUOTE, {}, SHORT_CUTS);
      } else {
        insertBreak();
      }

      return;
    }

    insertBreak();
  };

  return editor;
};
