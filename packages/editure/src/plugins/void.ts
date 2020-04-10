import { Editor, Transforms } from 'tuture-slate';
import { PARAGRAPH } from 'editure-constants';

import { getBeforeText } from '../utils';

export interface EditorWithVoid extends Editor {
  insertVoid(format: string, props?: any): void;
}

export const withVoid = <T extends Editor>(editor: T) => {
  const e = editor as T & EditorWithVoid;

  e.insertVoid = (format, props?) => {
    const { beforeText } = getBeforeText(editor);

    if (beforeText) {
      editor.insertBreak();
    }

    const text = { text: '' };

    Transforms.setNodes(editor, {
      type: format,
      ...props,
      children: [text],
    });
    Transforms.insertNodes(editor, { type: PARAGRAPH, children: [text] });
  };

  return e;
};
