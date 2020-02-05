import { Text } from "slate";
import MarkdownIt from "markdown-it";

import { deserializeFromHtml } from "./html";
import {
  BOLD,
  ITALIC,
  CODE,
  STRIKETHROUGH,
  UNDERLINE,
  LINK,
  BLOCK_QUOTE,
  H1,
  H2,
  H3,
  H4,
  H5,
  HR,
  NOTE,
  IMAGE,
  NUMBERED_LIST,
  BULLETED_LIST,
  PARAGRAPH,
  CODE_BLOCK
} from "../constants";

const MARK_DECORATORS = {
  [CODE]: node => ({ ...node, text: `\`${node.text}\`` }),
  [BOLD]: node => ({ ...node, text: `**${node.text}**` }),
  [ITALIC]: node => ({ ...node, text: `*${node.text}*` }),
  [STRIKETHROUGH]: node => ({ ...node, text: `~~${node.text}~~` }),
  [UNDERLINE]: node => node,
  [LINK]: node => ({ ...node, text: `[${node.text}](${node.url})` })
};

const joinChildren = (node, joinChar) =>
  node.children.map(n => serialize(n)).join(joinChar);

const BLOCK_CONVERTERS = {
  [H1]: node => `# ${joinChildren(node, "")}`,
  [H2]: node => `## ${joinChildren(node, "")}`,
  [H3]: node => `### ${joinChildren(node, "")}`,
  [H4]: node => `#### ${joinChildren(node, "")}`,
  [H5]: node => `##### ${joinChildren(node, "")}`,
  [PARAGRAPH]: node => joinChildren(node, ""),
  [IMAGE]: node => `![](${node.url})`,
  [HR]: () => "---",
  [BLOCK_QUOTE]: node =>
    joinChildren(node, "\n\n")
      .split("\n")
      .map(line => (line ? `> ${line}` : ">"))
      .join("\n"),
  [NOTE]: node =>
    joinChildren(node, "\n\n")
      .split("\n")
      .map(line => (line ? `> ${line}` : ">"))
      .join("\n"),
  [BULLETED_LIST]: node => {
    const { children, level = 0 } = node;
    return children
      .map(item => `${" ".repeat(level * 2)}- ${item.children[0].text}`)
      .join("\n");
  },
  [NUMBERED_LIST]: node => {
    const { children, level = 0 } = node;
    return children
      .map(
        (item, index) => `${" ".repeat(level * 2)}${index + 1}. ${item.children[0].text}`
      )
      .join("\n");
  },
  [CODE_BLOCK]: node => {
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

export const serializeToMarkdown = serialize;

export const deserializeFromMarkdown = text => {
  const md = new MarkdownIt();
  return deserializeFromHtml(md.render(text).replace(/\n/g, ""));
};
