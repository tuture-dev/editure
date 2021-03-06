import { Editor, Transforms, Range } from 'tuture-slate';
import { HR, PARAGRAPH } from 'editure-constants';

import { getBeforeText } from '../utils';
import { detectShortcut } from '../shortcuts';

const shortcutRegexes = [/^\s*---$/, /^\s*\*\*\*$/, /^\s*___$/];

export const withHr = (editor: Editor) => {
  const { isVoid, insertBreak } = editor;

  editor.isVoid = (element) => {
    return element.type === HR ? true : isVoid(element);
  };

  editor.insertBreak = () => {
    if (Range.isCollapsed(editor.selection!)) {
      const matchArr = detectShortcut(editor, shortcutRegexes);

      if (matchArr) {
        Transforms.select(editor, getBeforeText(editor).range!);
        Transforms.delete(editor);

        Transforms.setNodes(editor, { type: HR });
        Transforms.insertNodes(editor, { type: PARAGRAPH, children: [{ text: '' }] });

        return;
      }

      return insertBreak();
    }

    insertBreak();
  };

  return editor;
};
