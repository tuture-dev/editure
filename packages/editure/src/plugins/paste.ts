import { Transforms, Editor, Node } from 'tuture-slate';
import { LINK, IMAGE, CODE_BLOCK, CODE_LINE } from 'editure-constants';
import { parseHtml, parseMarkdown } from '../serializers';

import { isBlockActive } from '../helpers';
import { getBeforeText } from '../utils';

const containsMarkdownCode = (text: string) => {
  const testRegexes = [
    // Marks.
    /`[^`]+`/,
    /\*[^\*]+\*/,
    /_[^_]+_/,
    /~~[^~]~~/,
    /\[([^*]+)\]\(([^*]+)\)/,

    // Blocks.
    /!\[.*\]\(.+\)/,
    /^\* /,
    /^- /,
    /^\+ /,
    /^[0-9]\\. /,
    /^\s*>/,
    /^\s*#/,
    /^\s*```\s*([a-zA-Z]*)/,
    /^\s*---/
  ];

  for (const regex of testRegexes) {
    if (text.match(regex)) return true;
  }
  return false;
};

export default function withPaste(editor: Editor) {
  const { insertData, insertText, isInline, isVoid } = editor;

  editor.isInline = element => {
    return element.type === LINK ? true : isInline(element);
  };

  editor.isVoid = element => {
    return element.type === IMAGE ? true : isVoid(element);
  };

  editor.insertData = (data: DataTransfer) => {
    const dataTypes = Array.from(data.types);
    if (!dataTypes.includes('text/plain')) {
      return insertData(data);
    }

    const { selection } = editor;
    const { beforeText } = getBeforeText(editor);

    if (isBlockActive(editor, CODE_BLOCK)) {
      data
        .getData('text/plain')
        .trim()
        .split('\n')
        .forEach(line => {
          Transforms.insertNodes(editor, {
            type: CODE_LINE,
            children: [{ text: line.trimRight() }]
          });
        });

      // Delete this empty line if current code-line is empty.
      if (!beforeText && selection) {
        Transforms.removeNodes(editor, { at: selection });
      }

      return;
    }

    // Paste slate fragment data directly.
    if (dataTypes.includes('application/x-editure-fragment')) {
      return insertData(data);
    }

    const text = data.getData('text/plain');
    if (containsMarkdownCode(text)) {
      const parsed = parseMarkdown(text);
      if (parsed) {
        Transforms.insertNodes(editor, parsed as Node[]);

        if (!beforeText && selection) {
          Transforms.removeNodes(editor, { at: selection });
        }
      }

      return;
    }

    if (dataTypes.length === 1 && dataTypes[0] === 'text/plain') {
      return insertText(data.getData('text/plain'));
    }

    const html = data.getData('text/html');

    if (html) {
      const fragment = parseHtml(html) as Node[];
      const { selection } = editor;

      if (!selection) {
        return;
      }

      Transforms.insertNodes(editor, fragment);

      return;
    }

    insertData(data);
  };

  return editor;
}
