import { Editor, Transforms } from 'tuture-slate';
import shortid from 'shortid';
import * as F from 'editure-constants';
import { BULLETED_LIST, NUMBERED_LIST, PARAGRAPH } from 'editure-constants';

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

    switch (format) {
      case BULLETED_LIST:
      case NUMBERED_LIST: {
        let nodeProps = props;

        if (!isActive) {
          nodeProps = { ...nodeProps, level: 0, parent: format, type: F.LIST_ITEM };

          Transforms.setNodes(editor, {
            ...nodeProps,
            type: F.LIST_ITEM
          });

          const block = { type: format, children: [] };
          Transforms.wrapNodes(editor, block, nodeProps);
        } else {
          Transforms.unwrapNodes(editor, {
            match: n => LIST_TYPES.includes(n.type),
            split: true
          });

          Transforms.setNodes(editor, {
            type: PARAGRAPH
          });

          Transforms.unsetNodes(editor, ['parent', 'number', 'level']);
        }

        break;
      }

      case F.H1:
      case F.H2:
      case F.H3:
      case F.H4:
      case F.H5:
      case F.H6: {
        if (isActive) {
          Transforms.setNodes(editor, {
            type: PARAGRAPH
          });
        } else {
          Transforms.setNodes(editor, {
            id: shortid.generate(),
            type: format
          });
        }

        break;
      }

      case F.BLOCK_QUOTE:
      case F.CODE_BLOCK:
      case F.NOTE: {
        if (isActive && options) {
          const { exit, unwrap } = options;
          if (exit) {
            exitBlock(editor, format);
          } else if (unwrap) {
            unwrapBlock(editor, format);
          }
        } else {
          wrapBlock(editor, format, props);
        }

        break;
      }

      default: {
        Transforms.setNodes(editor, {
          type: isActive ? PARAGRAPH : format
        });
      }
    }
  });
};

export const updateBlock = (editor: Editor, format: string, props: any) => {
  Transforms.setNodes(editor, props, {
    match: n => n.type === format
  });
};
