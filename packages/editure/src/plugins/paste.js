import { Transforms, Editor, Element } from "slate";
import { LINK, IMAGE, CODE_BLOCK, CODE_LINE } from "editure-constants";
import { parseHtml, parseMarkdown } from "../serializers";

import { isBlockActive } from "../helpers";
import { getBeforeText } from "../utils";

const containsMarkdownCode = text => {
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

export default function withPaste(editor) {
  const { insertData, insertText, isInline, isVoid } = editor;

  editor.isInline = element => {
    return element.type === LINK ? true : isInline(element);
  };

  editor.isVoid = element => {
    return element.type === IMAGE ? true : isVoid(element);
  };

  editor.insertData = data => {
    const dataTypes = Array.from(data.types);
    if (!dataTypes.includes("text/plain")) {
      return insertData(data);
    }

    const { selection } = editor;
    const { beforeText } = getBeforeText(editor);

    if (isBlockActive(editor, CODE_BLOCK)) {
      data
        .getData("text/plain")
        .trim()
        .split("\n")
        .forEach(line => {
          Transforms.insertNodes(editor, {
            type: CODE_LINE,
            children: [{ text: line.trimRight() }]
          });
        });

      // 如果粘贴时所在 code-line 为空，则删除此空行
      if (!beforeText) {
        Transforms.removeNodes(editor, { at: selection });
      }

      return;
    }

    // Paste slate fragment data directly.
    if (dataTypes.includes("application/x-editure-fragment")) {
      return insertData(data);
    }

    const text = data.getData("text/plain");
    if (containsMarkdownCode(text)) {
      const parsed = parseMarkdown(text);
      Transforms.insertNodes(editor, parsed);

      if (!beforeText) {
        Transforms.removeNodes(editor, { at: selection });
      }
      return;
    }

    if (dataTypes.length === 1 && dataTypes[0] === "text/plain") {
      return insertText(data.getData("text/plain"));
    }

    const html = data.getData("text/html");

    if (html) {
      const fragment = parseHtml(html);
      const { selection } = editor;
      const { focus } = selection;

      Transforms.insertNodes(editor, fragment);

      const nodeLen = fragment
        .map(node => Editor.isBlock(editor, node))
        .reduce((a, b) => a + b, 0);

      Transforms.select(editor, Editor.end(editor, [focus.path[0] + nodeLen]));

      const numOfElements = fragment
        .map(node => Element.isElement(node))
        .reduce((a, b) => a + b, 0);

      // 如果插入的 node 至少有一个 element，并且粘贴时所在行为空，则删除此空行
      if (numOfElements >= 1 && !beforeText) {
        Transforms.removeNodes(editor, { at: selection });
      }

      return;
    }

    insertData(data);
  };

  return editor;
}
