import { Editor, Transforms } from 'slate';
import shortid from 'shortid';
import F from 'editure-constants';

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

const wrapBlock = (editor: Editor, format: string, props: any) => {
  if (![F.BLOCK_QUOTE, F.CODE_BLOCK, F.NOTE].includes(format)) {
    return;
  }

  const text = { text: '' };
  const childType = format === F.CODE_BLOCK ? F.CODE_LINE : F.PARAGRAPH;
  const node = { type: format, ...props, children: [text] };

  Transforms.setNodes(editor, { type: childType, children: [text] });
  Transforms.wrapNodes(editor, node, {
    match: n => n.type === childType
  });
};

const unwrapBlock = (editor: Editor, format: string) => {
  if (![F.BLOCK_QUOTE, F.CODE_BLOCK, F.NOTE].includes(format)) {
    return;
  }

  if (format === F.CODE_BLOCK) {
    const block = Editor.above(editor, {
      match: n => n.type === F.CODE_BLOCK
    });

    if (block) {
      const [, path] = block;
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
    }

    return;
  }

  Transforms.unwrapNodes(editor, {
    match: n => n.type === format
  });
};

const exitBlock = (editor: Editor, format: string) => {
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

  const block = Editor.above(editor, {
    match: n => n.type === F.PARAGRAPH
  });

  if (block) {
    const [, path] = block;
    Transforms.unwrapNodes(editor, {
      at: {
        anchor: Editor.start(editor, path),
        focus: Editor.end(editor, path)
      },
      match: n => n.type === format,
      split: true
    });
  }
};

export const isBlockActive = (editor: Editor, format: string) => {
  try {
    const [match] = Editor.nodes(editor, {
      match: n => n.type === format
    });
    return !!match;
  } catch {
    return false;
  }
};

export const detectBlockFormat = (editor: Editor, formats = BLOCK_TYPES) => {
  let pathLength = -1;
  let realFormat = null;

  try {
    for (const format of formats) {
      if (isBlockActive(editor, format)) {
        const block = Editor.above(editor, {
          match: n => n.type === format
        });

        if (block) {
          const [, path] = block;

          if (path.length > pathLength) {
            pathLength = path.length;
            realFormat = format;
          }
        }
      }
    }
  } catch {
    realFormat = null;
  }

  return realFormat;
};

type ToggleBlockOptions = {
  exit?: boolean;
  unwrap?: boolean;
};

export const toggleBlock = (
  editor: Editor,
  format: string,
  props?: any,
  options?: ToggleBlockOptions
) => {
  Editor.withoutNormalizing(editor, () => {
    const isActive = isBlockActive(editor, format);
    const isList = LIST_TYPES.includes(format);

    let nodeProps = props;
    if (isList) {
      nodeProps = { ...nodeProps, level: 0, parent: format, type: F.LIST_ITEM };
    }
    if ([F.H1, F.H2, F.H3, F.H4, F.H5, F.H6].includes(format)) {
      nodeProps = { ...nodeProps, id: shortid.generate() };
    }

    Transforms.unwrapNodes(editor, {
      match: n => LIST_TYPES.includes(n.type),
      split: true
    });

    if ([F.BLOCK_QUOTE, F.CODE_BLOCK, F.NOTE].includes(format)) {
      if (isActive && options) {
        const { exit, unwrap } = options;
        if (exit) {
          exitBlock(editor, format);
        } else if (unwrap) {
          unwrapBlock(editor, format);
        }
      } else {
        wrapBlock(editor, format, nodeProps);
      }
    } else {
      Transforms.setNodes(editor, {
        ...nodeProps,
        type: isActive ? F.PARAGRAPH : isList ? F.LIST_ITEM : format
      });
    }

    if (!isActive && isList) {
      const block = { type: format, children: [] };
      Transforms.wrapNodes(editor, block, nodeProps);
    }
  });
};

export const updateBlock = (editor: Editor, format: string, props: any) => {
  Transforms.setNodes(editor, props, {
    match: n => n.type === format
  });
};
