import { Editor, Transforms, Point } from 'tuture-slate';
import * as F from 'editure-constants';

import { withBaseBlock, EditorWithBlock } from './base-block';
import { getLineText } from '../utils';

export interface EditorWithContainer extends EditorWithBlock {
  getChildFormat(format?: string): string;
  deleteByCharacter(format: string): void;
  wrapBlock(format: string, props?: any): void;
  unwrapBlock(format: string): void;
  exitBlock(format: string): void;
}

export const withBaseContainer = (editor: Editor) => {
  const e = withBaseBlock(editor) as EditorWithContainer;

  const { deleteBackward } = e;

  e.deleteByCharacter = format => {
    const { selection } = e;

    if (!selection) return;

    const match = Editor.above(e, {
      match: n => n.type === format
    });

    if (match) {
      const [block, path] = match;
      const start = Editor.start(e, path);

      if (
        block.type !== F.PARAGRAPH &&
        Point.equals(selection.anchor, start) &&
        e.isBlockActive(e.getChildFormat(format))
      ) {
        const { wholeLineText } = getLineText(e);
        const { children = [] } = block;

        Editor.withoutNormalizing(e, () => {
          if (children.length === 1 && !wholeLineText) {
            e.toggleBlock(format);
          } else if (children.length > 1) {
            Transforms.mergeNodes(e);
          }
        });

        return;
      }

      return deleteBackward('character');
    }

    deleteBackward('character');
  };

  e.getChildFormat = () => {
    return F.PARAGRAPH;
  };

  e.wrapBlock = (format: string, props?: any) => {
    const text = { text: '' };
    const node = { type: format, ...props, children: [text] };
    const childFormat = e.getChildFormat(format);

    Transforms.setNodes(editor, { type: childFormat, children: [text] });
    Transforms.wrapNodes(editor, node, {
      match: n => n.type === childFormat
    });
  };

  e.unwrapBlock = (format: string) => {
    Transforms.unwrapNodes(editor, {
      match: n => n.type === format
    });
  };

  e.toggleBlock = (format: string, props?: any) => {
    Editor.withoutNormalizing(editor, () => {
      const isActive = e.isBlockActive(format);

      if (isActive) {
        e.unwrapBlock(format);
      } else {
        e.wrapBlock(format, props);
      }
    });
  };

  e.exitBlock = (format: string) => {
    const block = Editor.above(editor, {
      match: n => n.type === e.getChildFormat(format)
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

  return e;
};
