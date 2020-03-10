import { Editor, Transforms, Range } from 'tuture-slate';
import isUrl from 'is-url';
import { LINK } from 'editure-constants';

import { insertLink } from '../helpers';
import { detectShortcut, handleMarkShortcut } from '../shortcuts';

const shortcutRegexes = [/\[([^*]+)\]\(([^*]+)\)/];

export default function withLink(editor: Editor) {
  const { insertData, insertText, isInline } = editor;

  editor.isInline = element => {
    return element.type === LINK ? true : isInline(element);
  };

  editor.insertText = text => {
    if (text && isUrl(text)) {
      return insertLink(editor, text, text);
    }

    const { selection } = editor;

    if (text === ' ' && selection && Range.isCollapsed(selection)) {
      const matchArr = detectShortcut(editor, shortcutRegexes);

      if (matchArr) {
        handleMarkShortcut(editor, LINK, matchArr);
        Transforms.setNodes(editor, { url: matchArr[2] }, { match: n => n.link });
      }

      return insertText(' ');
    }

    insertText(text);
  };

  editor.insertData = (data: DataTransfer) => {
    const text = data.getData('text/plain');

    if (text && isUrl(text)) {
      insertLink(editor, text, text);
    } else {
      insertData(data);
    }
  };

  return editor;
}
