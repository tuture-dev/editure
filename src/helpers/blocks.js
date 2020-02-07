import { Editor, Transforms } from "slate";
import * as F from "../constants";

const LIST_TYPES = [F.NUMBERED_LIST, F.BULLETED_LIST];

export const BLOCK_TYPES = [
  F.H1,
  F.H2,
  F.H3,
  F.H4,
  F.CODE_BLOCK,
  F.NUMBERED_LIST,
  F.BULLETED_LIST,
  F.PARAGRAPH,
  F.LIST_ITEM,
  F.BLOCK_QUOTE,
  F.NOTE,
  F.IMAGE,
  F.HR
];

const wrapBlock = (editor, format, props) => {
  if (![F.BLOCK_QUOTE, F.CODE_BLOCK, F.NOTE].includes(format)) {
    return;
  }

  const text = { text: "" };
  const childType = format === F.CODE_BLOCK ? F.CODE_LINE : F.PARAGRAPH;
  const node = { type: format, ...props, children: [text] };

  Transforms.setNodes(editor, { type: childType, children: [text] });
  Transforms.wrapNodes(editor, node, {
    match: n => n.type === childType
  });
};

export const unwrapBlock = (editor, format) => {
  if (![F.BLOCK_QUOTE, F.CODE_BLOCK, F.NOTE].includes(format)) {
    return;
  }

  if (format === F.CODE_BLOCK) {
    const [, path] = Editor.above(editor, {
      match: n => n.type === F.CODE_BLOCK
    });

    const anchor = Editor.start(editor, path);
    const focus = Editor.end(editor, path);
    const range = { anchor, focus };

    Transforms.setNodes(
      editor,
      { type: F.PARAGRAPH },
      {
        at: range,
        match: n => n.type === F.CODE_LINE
      }
    );
    Transforms.unwrapNodes(editor, {
      at: range,
      match: n => n.type === F.CODE_BLOCK
    });

    return;
  }

  Transforms.unwrapNodes(editor, {
    match: n => n.type === format
  });
};

const exitBlock = (editor, format) => {
  if (![F.BLOCK_QUOTE, F.CODE_BLOCK, F.NOTE].includes(format)) {
    return;
  }

  if (format === F.CODE_BLOCK) {
    Transforms.setNodes(
      editor,
      { type: F.PARAGRAPH },
      { match: n => n.type === F.CODE_LINE }
    );

    Transforms.unwrapNodes(editor, {
      match: n => n.type === F.CODE_BLOCK,
      split: true
    });

    return;
  }

  const [, path] = Editor.above(editor, {
    match: n => n.type === F.PARAGRAPH
  });

  Transforms.unwrapNodes(editor, {
    at: {
      anchor: Editor.start(editor, path),
      focus: Editor.end(editor, path)
    },
    match: n => n.type === format,
    split: true
  });
};

export const handleActiveBlockquote = (editor, type) => {
  switch (type) {
    case F.TOOL_BUTTON: {
      unwrapBlock(editor, F.BLOCK_QUOTE);
      break;
    }

    case F.SHORT_CUTS: {
      exitBlock(editor, F.BLOCK_QUOTE);
      break;
    }

    case F.HOT_KEY: {
      unwrapBlock(editor, F.BLOCK_QUOTE);
      break;
    }

    default: {
      return;
    }
  }
};

export const handleActiveCodeBlock = (editor, type) => {
  switch (type) {
    case F.TOOL_BUTTON: {
      unwrapBlock(editor, F.CODE_BLOCK);
      break;
    }

    case F.SHORT_CUTS: {
      exitBlock(editor, F.CODE_BLOCK);
      break;
    }

    case F.HOT_KEY: {
      unwrapBlock(editor, F.CODE_BLOCK);
      break;
    }

    default: {
      return;
    }
  }
};

export const handleActiveNote = (editor, type) => {
  switch (type) {
    case F.TOOL_BUTTON: {
      unwrapBlock(editor, F.NOTE);
      break;
    }

    case F.SHORT_CUTS: {
      exitBlock(editor, F.NOTE);
      break;
    }

    case F.HOT_KEY: {
      unwrapBlock(editor, F.NOTE);
      break;
    }

    default: {
      return;
    }
  }
};

export const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format
  });

  return !!match;
};

export const getBlock = (editor, format) => {
  const node = Editor.above(editor, {
    match: n => n.type === format
  });

  return node;
};

export const detectBlockFormat = (editor, formats = BLOCK_TYPES) => {
  let pathLength = -1;
  let realFormat = null;

  for (const format of formats) {
    if (isBlockActive(editor, format)) {
      const [, path] = getBlock(editor, format);

      if (path.length > pathLength) {
        pathLength = path.length;
        realFormat = format;
      }
    }
  }

  return realFormat;
};

export const toggleBlock = (editor, format, props, type) => {
  console.log("toggleBlock", format);
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  let nodeProps = props;
  if (isList) {
    nodeProps = { ...nodeProps, level: 0, parent: format, type: F.LIST_ITEM };
  }

  Transforms.unwrapNodes(editor, {
    match: n => LIST_TYPES.includes(n.type),
    split: true
  });

  switch (format) {
    case F.CODE_BLOCK: {
      if (isActive) {
        handleActiveCodeBlock(editor, type);
      } else {
        wrapBlock(editor, format, nodeProps);
      }

      break;
    }

    case F.BLOCK_QUOTE: {
      if (isActive) {
        handleActiveBlockquote(editor, type);
      } else {
        wrapBlock(editor, format);
      }

      break;
    }

    case F.NOTE: {
      if (isActive) {
        handleActiveNote(editor, type);
      } else {
        wrapBlock(editor, format, nodeProps);
      }

      break;
    }

    default: {
      Transforms.setNodes(editor, {
        ...nodeProps,
        type: isActive ? F.PARAGRAPH : isList ? F.LIST_ITEM : format
      });
    }
  }

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};
