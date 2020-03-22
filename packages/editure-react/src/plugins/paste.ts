import { Transforms, Node, parseHtml, parseMarkdown, getBeforeText } from 'editure';

import { PARAGRAPH, LINK, IMAGE, CODE_BLOCK, CODE_LINE } from 'editure-constants';
import { ReactEditor } from 'tuture-slate-react';

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
    /^\s*---/,
  ];

  for (const regex of testRegexes) {
    if (text.match(regex)) return true;
  }
  return false;
};

export const withPaste = (editor: ReactEditor) => {
  const { insertData, insertText, isInline, isVoid } = editor;

  editor.isInline = (element) => {
    return element.type === LINK ? true : isInline(element);
  };

  editor.isVoid = (element) => {
    return element.type === IMAGE ? true : isVoid(element);
  };

  editor.insertData = (data) => {
    const dataTypes = Array.from(data.types);
    if (!dataTypes.includes('text/plain')) {
      return insertData(data);
    }

    const { selection } = editor;
    const { beforeText } = getBeforeText(editor);

    if (editor.isBlockActive(CODE_BLOCK)) {
      data
        .getData('text/plain')
        .trim()
        .split('\n')
        .forEach((line) => {
          Transforms.insertNodes(editor, {
            type: CODE_LINE,
            children: [{ text: line.trimRight() }],
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
        Transforms.insertFragment(editor, parsed as Node[]);

        if (!beforeText && selection) {
          Transforms.removeNodes(editor, { at: selection });
        }
      }

      return;
    }

    if (dataTypes.length === 1 && dataTypes[0] === 'text/plain') {
      return data
        .getData('text/plain')
        .trim()
        .split('\n')
        .filter((line) => line)
        .forEach((line, index) => {
          if (index === 0) {
            // Insert the first line without creating a new paragraph.
            return insertText(line);
          }

          Transforms.insertNodes(editor, {
            type: PARAGRAPH,
            children: [{ text: line }],
          });
        });
    }

    const html = data.getData('text/html');

    if (html) {
      const fragment = parseHtml(html) as Node[];
      const { selection } = editor;

      if (!selection) {
        return;
      }

      return Transforms.insertFragment(editor, fragment);
    }

    insertData(data);
  };

  return editor;
};
