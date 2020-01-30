import { Transforms, Editor, Point, Range } from "slate";

import {
  CODE_BLOCK,
  CODE_LINE,
  PARAGRAPH,
  TOOL_BUTTON,
  HOT_KEY,
  SHORT_CUTS
} from "../constants";
import { isBlockActive } from "../blocks";
import { getLineText } from "../utils";

export const wrapCodeBlock = (editor, props) => {
  const text = { text: "" };
  const codeLineNode = { type: CODE_LINE, children: [text] };
  const node = { type: CODE_BLOCK, ...props, children: [text] };

  Transforms.setNodes(editor, codeLineNode);
  Transforms.wrapNodes(editor, node, {
    match: n => n.type === CODE_LINE
  });
};

export const unwrapCodeBlock = editor => {
  const [_, path] = Editor.above(editor, {
    match: n => n.type === CODE_BLOCK
  });

  const anchor = Editor.start(editor, path);
  const focus = Editor.end(editor, path);
  const range = { anchor, focus };

  Transforms.setNodes(
    editor,
    { type: PARAGRAPH },
    {
      at: range,
      match: n => n.type === CODE_LINE
    }
  );
  Transforms.unwrapNodes(editor, {
    at: range,
    match: n => n.type === CODE_BLOCK
  });
};

export const exitCodeBlock = editor => {
  Transforms.setNodes(
    editor,
    {
      type: PARAGRAPH
    },
    {
      match: n => n.type === CODE_LINE
    }
  );

  Transforms.unwrapNodes(editor, {
    match: n => n.type === CODE_BLOCK,
    split: true
  });
};

export const handleActiveCodeBlock = (editor, type) => {
  switch (type) {
    case TOOL_BUTTON: {
      unwrapCodeBlock(editor);
      break;
    }

    case SHORT_CUTS: {
      exitCodeBlock(editor);
      break;
    }

    case HOT_KEY: {
      unwrapCodeBlock(editor);
      break;
    }
  }
};

export const withCodeBlock = editor => {
  const { deleteBackward } = editor;

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: n => n.type === CODE_BLOCK
      });

      if (match) {
        const [block, path] = match;
        const start = Editor.start(editor, path);

        if (
          block.type !== PARAGRAPH &&
          Point.equals(selection.anchor, start) &&
          isBlockActive(editor, CODE_LINE)
        ) {
          const [node, _] = Editor.above(editor, {
            match: n => n.type === CODE_BLOCK
          });

          const { wholeLineText } = getLineText(editor);
          const { children = [] } = node;

          if (children.length === 1 && !wholeLineText) {
            unwrapCodeBlock(editor);
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
