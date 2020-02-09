import { Text } from "slate";
import MarkdownIt from "markdown-it";
import * as F from "editure-constants";

import { deserializeFromHtml } from "./html";

const MARK_DECORATORS = {
  [F.CODE]: node => ({ ...node, text: `\`${node.text}\`` }),
  [F.BOLD]: node => ({ ...node, text: `**${node.text}**` }),
  [F.ITALIC]: node => ({ ...node, text: `*${node.text}*` }),
  [F.STRIKETHROUGH]: node => ({ ...node, text: `~~${node.text}~~` }),
  [F.UNDERLINE]: node => node,
  [F.LINK]: node => ({ ...node, text: `[${node.text}](${node.url})` })
};

const joinChildren = (node, joinChar) =>
  node.children.map(n => serialize(n)).join(joinChar);

const BLOCK_CONVERTERS = {
  [F.H1]: node => `# ${joinChildren(node, "")}`,
  [F.H2]: node => `## ${joinChildren(node, "")}`,
  [F.H3]: node => `### ${joinChildren(node, "")}`,
  [F.H4]: node => `#### ${joinChildren(node, "")}`,
  [F.H5]: node => `##### ${joinChildren(node, "")}`,
  [F.PARAGRAPH]: node => joinChildren(node, ""),
  [F.IMAGE]: node => `![](${node.url})`,
  [F.HR]: () => "---",
  [F.BLOCK_QUOTE]: node =>
    joinChildren(node, "\n\n")
      .split("\n")
      .map(line => (line ? `> ${line}` : ">"))
      .join("\n"),
  [F.NOTE]: node =>
    joinChildren(node, "\n\n")
      .split("\n")
      .map(line => (line ? `> ${line}` : ">"))
      .join("\n"),
  [F.BULLETED_LIST]: node => {
    const { children, level = 0 } = node;
    return children
      .map(item => `${" ".repeat(level * 2)}- ${item.children[0].text}`)
      .join("\n");
  },
  [F.NUMBERED_LIST]: node => {
    const { children, level = 0 } = node;
    return children
      .map(
        (item, index) => `${" ".repeat(level * 2)}${index + 1}. ${item.children[0].text}`
      )
      .join("\n");
  },
  [F.CODE_BLOCK]: node => {
    const { children, lang = "" } = node;
    const codeLines = children.map(line => line.children[0].text);
    return `\`\`\`${lang}\n${codeLines.join("\n")}\n\`\`\``;
  }
};

const serialize = node => {
  if (Text.isText(node)) {
    const markedNode = Object.keys(MARK_DECORATORS).reduce(
      (decoratedNode, currentMark) => {
        return node[currentMark]
          ? MARK_DECORATORS[currentMark](decoratedNode)
          : decoratedNode;
      },
      node
    );

    return markedNode.text;
  }

  const converter = BLOCK_CONVERTERS[node.type];
  if (typeof converter === "function") {
    return converter(node);
  }

  return joinChildren(node, "\n\n");
};

const md = new MarkdownIt({ linkify: true });

export const serializeToMarkdown = serialize;

export const deserializeFromMarkdown = text => {
  return deserializeFromHtml(md.render(text).replace(/\n/g, ""));
};
