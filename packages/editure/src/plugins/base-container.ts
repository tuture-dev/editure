import { Editor, Transforms } from 'tuture-slate';
import * as F from 'editure-constants';

import { Plugin } from '../interfaces';
import { EditorWithBlock } from './base-block';

export interface EditorWithContainer extends EditorWithBlock {
  getChildFormat(format?: string): string;
  wrapBlock(format: string, props?: any): void;
  unwrapBlock(format: string): void;
  exitBlock(format: string): void;
}

export const withBaseContainer: Plugin<EditorWithBlock, EditorWithContainer> = editor => {
  const e = editor as EditorWithContainer;

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
