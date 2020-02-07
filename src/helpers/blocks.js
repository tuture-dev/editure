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

export const unwrapBlockquote = editor => {
  Transforms.unwrapNodes(editor, {
    match: n => n.type === F.BLOCK_QUOTE
  });
};

export const exitBlockquote = editor => {
  const [, path] = Editor.above(editor, {
    match: n => n.type === F.PARAGRAPH
  });

  const start = Editor.start(editor, path);
  const end = Editor.end(editor, path);

  const range = { anchor: start, focus: end };

  Transforms.unwrapNodes(editor, {
    at: range,
    match: n => n.type === F.BLOCK_QUOTE,
    split: true
  });
};

export const handleActiveBlockquote = (editor, type) => {
  switch (type) {
    case F.TOOL_BUTTON: {
      unwrapBlockquote(editor);
      break;
    }

    case F.SHORT_CUTS: {
      exitBlockquote(editor);
      break;
    }

    case F.HOT_KEY: {
      unwrapBlockquote(editor);
      break;
    }

    default: {
      return;
    }
  }
};

export const unwrapCodeBlock = editor => {
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
};

export const exitCodeBlock = editor => {
  Transforms.setNodes(
    editor,
    {
      type: F.PARAGRAPH
    },
    {
      match: n => n.type === F.CODE_LINE
    }
  );

  Transforms.unwrapNodes(editor, {
    match: n => n.type === F.CODE_BLOCK,
    split: true
  });
};

export const handleActiveCodeBlock = (editor, type) => {
  switch (type) {
    case F.TOOL_BUTTON: {
      unwrapCodeBlock(editor);
      break;
    }

    case F.SHORT_CUTS: {
      exitCodeBlock(editor);
      break;
    }

    case F.HOT_KEY: {
      unwrapCodeBlock(editor);
      break;
    }

    default: {
      return;
    }
  }
};

export const unwrapNote = editor => {
  Transforms.unwrapNodes(editor, {
    match: n => n.type === F.NOTE
  });
};

export const exitNote = editor => {
  const [, path] = Editor.above(editor, {
    match: n => n.type === F.PARAGRAPH
  });

  const start = Editor.start(editor, path);
  const end = Editor.end(editor, path);

  const range = { anchor: start, focus: end };

  Transforms.unwrapNodes(editor, {
    at: range,
    match: n => n.type === F.NOTE,
    split: true
  });
};

export const handleActiveNote = (editor, type) => {
  switch (type) {
    case F.TOOL_BUTTON: {
      unwrapNote(editor);
      break;
    }

    case F.SHORT_CUTS: {
      exitNote(editor);
      break;
    }

    case F.HOT_KEY: {
      unwrapNote(editor);
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
