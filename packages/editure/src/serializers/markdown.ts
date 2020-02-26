import { Node, Element, Text } from 'slate';
import MarkdownIt from 'markdown-it';
import * as F from 'editure-constants';

import { parseHtml } from './html';
import { MarkDecoratorGroup, BlockConverterGroup } from './types';

const joinChildren = (node: Element, joinChar: string): string =>
  node.children.map(n => serialize(n)).join(joinChar);

let markDecorators: MarkDecoratorGroup = {
  [F.CODE]: node => ({ ...node, text: `\`${node.text}\`` }),
  [F.BOLD]: node => ({ ...node, text: `**${node.text}**` }),
  [F.ITALIC]: node => ({ ...node, text: `*${node.text}*` }),
  [F.STRIKETHROUGH]: node => ({ ...node, text: `~~${node.text}~~` }),
  [F.UNDERLINE]: node => node,
  [F.LINK]: node => ({ ...node, text: `[${node.text}](${node.url})` })
};

let blockConverters: BlockConverterGroup = {
  [F.H1]: node => `# ${joinChildren(node, '')}`,
  [F.H2]: node => `## ${joinChildren(node, '')}`,
  [F.H3]: node => `### ${joinChildren(node, '')}`,
  [F.H4]: node => `#### ${joinChildren(node, '')}`,
  [F.H5]: node => `##### ${joinChildren(node, '')}`,
  [F.PARAGRAPH]: node => joinChildren(node, ''),
  [F.IMAGE]: node => `![](${node.url})`,
  [F.HR]: () => '---',
  [F.BLOCK_QUOTE]: node =>
    joinChildren(node, '\n\n')
      .split('\n')
      .map(line => (line ? `> ${line}` : '>'))
      .join('\n'),
  [F.NOTE]: node =>
    joinChildren(node, '\n\n')
      .split('\n')
      .map(line => (line ? `> ${line}` : '>'))
      .join('\n'),
  [F.LIST_ITEM]: node => joinChildren(node, ''),
  [F.BULLETED_LIST]: node => {
    const { children, level = 0 } = node;
    return children
      .map(item => `${' '.repeat(level * 2)}- ${serialize(item)}`)
      .join('\n');
  },
  [F.NUMBERED_LIST]: node => {
    const { children, level = 0 } = node;
    return children
      .map((item, index) => `${' '.repeat(level * 2)}${index + 1}. ${serialize(item)}`)
      .join('\n');
  },
  [F.CODE_BLOCK]: node => {
    const { children, lang = '' } = node;
    const codeLines = children.map(line => line.children[0].text);
    return `\`\`\`${lang}\n${codeLines.join('\n')}\n\`\`\``;
  }
};

const serialize = (node: Node) => {
  if (Text.isText(node)) {
    const markedNode = Object.keys(markDecorators).reduce(
      (decoratedNode, currentMark) => {
        return node[currentMark]
          ? markDecorators[currentMark](decoratedNode)
          : decoratedNode;
      },
      node
    );

    return markedNode.text;
  }

  const converter = blockConverters[node.type];
  if (typeof converter === 'function') {
    return converter(node);
  }

  return joinChildren(node, '\n\n');
};

const md = new MarkdownIt({ linkify: true });

export const toMarkdown = (
  node: Node,
  customMarkDecorators?: MarkDecoratorGroup | null,
  customBlockConverters?: BlockConverterGroup | null
) => {
  markDecorators = { ...markDecorators, ...customMarkDecorators };
  blockConverters = { ...blockConverters, ...customBlockConverters };

  return serialize(node);
};

export const parseMarkdown = (text: string) => {
  return parseHtml(md.render(text).replace(/\n/g, ''));
};
