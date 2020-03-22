import { Node, Element, Text } from 'tuture-slate';
import MarkdownIt from 'markdown-it';
import * as F from 'editure-constants';

import { Token, MarkDecoratorGroup, BlockConverterGroup } from './types';

const joinChildren = (node: Element, joinChar: string): string =>
  node.children.map((n) => serialize(n)).join(joinChar);

let markDecorators: MarkDecoratorGroup = {
  [F.CODE]: (node) => ({ ...node, text: `\`${node.text}\`` }),
  [F.BOLD]: (node) => ({ ...node, text: `**${node.text}**` }),
  [F.ITALIC]: (node) => ({ ...node, text: `*${node.text}*` }),
  [F.STRIKETHROUGH]: (node) => ({ ...node, text: `~~${node.text}~~` }),
  [F.UNDERLINE]: (node) => node,
  [F.LINK]: (node) => ({ ...node, text: `[${node.text}](${node.url})` }),
};

let blockConverters: BlockConverterGroup = {
  [F.H1]: (node) => `# ${joinChildren(node, '')}`,
  [F.H2]: (node) => `## ${joinChildren(node, '')}`,
  [F.H3]: (node) => `### ${joinChildren(node, '')}`,
  [F.H4]: (node) => `#### ${joinChildren(node, '')}`,
  [F.H5]: (node) => `##### ${joinChildren(node, '')}`,
  [F.PARAGRAPH]: (node) => joinChildren(node, ''),
  [F.IMAGE]: (node) => `![](${node.url})`,
  [F.HR]: () => '---',
  [F.BLOCK_QUOTE]: (node) =>
    joinChildren(node, '\n\n')
      .split('\n')
      .map((line) => (line ? `> ${line}` : '>'))
      .join('\n'),
  [F.NOTE]: (node) =>
    joinChildren(node, '\n\n')
      .split('\n')
      .map((line) => (line ? `> ${line}` : '>'))
      .join('\n'),
  [F.LIST_ITEM]: (node) => joinChildren(node, ''),
  [F.BULLETED_LIST]: (node) => {
    const { children, level = 0 } = node;
    return children.map((item) => `${' '.repeat(level * 2)}- ${serialize(item)}`).join('\n');
  },
  [F.NUMBERED_LIST]: (node) => {
    const { children, level = 0 } = node;
    return children
      .map((item, index) => `${' '.repeat(level * 2)}${index + 1}. ${serialize(item)}`)
      .join('\n');
  },
  [F.CODE_BLOCK]: (node) => {
    const { children, lang = '' } = node;
    const codeLines = children.map((line) => line.children[0].text);
    return `\`\`\`${lang}\n${codeLines.join('\n')}\n\`\`\``;
  },
};

const serialize = (node: Node) => {
  if (Text.isText(node)) {
    const markedNode = Object.keys(markDecorators).reduce((decoratedNode, currentMark) => {
      return node[currentMark] ? markDecorators[currentMark](decoratedNode) : decoratedNode;
    }, node);

    return markedNode.text;
  }

  const converter = blockConverters[node.type];
  if (typeof converter === 'function') {
    return converter(node);
  }

  return joinChildren(node, '\n\n');
};

export const toMarkdown = (
  node: Node,
  customMarkDecorators?: MarkDecoratorGroup | null,
  customBlockConverters?: BlockConverterGroup | null,
) => {
  markDecorators = { ...markDecorators, ...customMarkDecorators };
  blockConverters = { ...blockConverters, ...customBlockConverters };

  return serialize(node);
};

const headingMap = {
  h1: F.H1,
  h2: F.H2,
  h3: F.H3,
  h4: F.H4,
  h5: F.H5,
  h6: F.H6,
};

const blockTypeToName = {
  bullet_list: F.BULLETED_LIST,
  ordered_list: F.NUMBERED_LIST,
  list_item: F.LIST_ITEM,
  blockquote: F.BLOCK_QUOTE,
};

function getNodeProps(token: Token) {
  const props: any = {};
  const typeMatchArr = token.type.match(/(\w+)_open/);

  if (typeMatchArr) {
    const blockType = typeMatchArr[1];
    const levelMatchArr = blockType.match(/container_(\w+)/);

    if (levelMatchArr) {
      props.type = 'note';
      props.level = levelMatchArr[1];
    } else if (blockType === 'heading') {
      props.type = headingMap[token.tag];
    } else {
      props.type = blockTypeToName[blockType] || blockType;
    }
  } else {
    props.type = token.type;
  }

  return props;
}

function parseInline(tokens: Token[]) {
  const parsed = [];
  const activeMarks: any = {};

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    switch (token.type) {
      case 'text': {
        if (token.content) {
          parsed.push({ ...activeMarks, text: token.content });
        }
        break;
      }
      case 'code_inline': {
        parsed.push({ ...activeMarks, code: true, text: token.content });
        break;
      }
      case 'strong_open': {
        activeMarks.bold = true;
        break;
      }
      case 'strong_close': {
        delete activeMarks.bold;
        break;
      }
      case 'em_open': {
        activeMarks.italic = true;
        break;
      }
      case 'em_close': {
        delete activeMarks.italic;
        break;
      }
      case 's_open': {
        activeMarks.strikethrough = true;
        break;
      }
      case 's_open': {
        delete activeMarks.strikethrough;
        break;
      }
      case 'link_open': {
        activeMarks.link = true;
        if (token.attrs) {
          activeMarks.url = token.attrs[0][1];
        }
        break;
      }
      case 'link_close': {
        delete activeMarks.link;
        delete activeMarks.url;
        break;
      }
      case 'image': {
        parsed.push({
          type: 'image',
          url: token.attrs && token.attrs[0][1],
          children: [{ text: '' }],
        });
        break;
      }
      default: {
        // throw new Error(
        //   `unsupported inline token:\n ${JSON.stringify(token, null, 2)}`
        // );
      }
    }
  }

  return parsed;
}

function parseCodeFence(token: Token) {
  return {
    type: F.CODE_BLOCK,
    lang: token.info,
    children: token.content
      .trim()
      .split('\n')
      .map((line) => ({
        type: F.CODE_LINE,
        children: [{ text: line }],
      })),
  };
}

function adjustNumberedList(node: Node) {
  const counterStack = [];
  let counter = 0;
  let lastLevel = 0;

  for (const child of node.children) {
    const { level = 0 } = child;
    if (level > lastLevel) {
      counterStack.push(counter);
      counter = 1;
    } else if (level < lastLevel) {
      while (level < lastLevel) {
        counter = Number(counterStack.pop()) + 1;
        lastLevel--;
      }
    } else {
      counter++;
    }

    child.number = counter;

    lastLevel = level;
  }
}

function toFragment(tokens: Token[], parentToken?: Token) {
  const parsed: Node[] = [];

  let tokenStack = [];
  let currentBlockToken = null;
  let currentBlockType = null;

  for (const token of tokens) {
    const { type, children } = token;

    if (currentBlockType) {
      if (type === `${currentBlockType}_close`) {
        // Parse the block with all its child tokens.
        const node: Node = {
          ...getNodeProps(currentBlockToken as Token),
          children: toFragment(tokenStack, currentBlockToken as Token),
        };

        if (node.type === F.LIST_ITEM) {
          node.children = node.children[0].children;
          if (parentToken) {
            node.parent = getNodeProps(parentToken).type;
            node.level = parentToken.level;
          }
        }
        if (node.type === F.NUMBERED_LIST) {
          adjustNumberedList(node);
        }
        if (node.type === F.NOTE && node.children[0].children[0].bold) {
          node.children = node.children.slice(1);
        }

        parsed.push(node);

        // Get ready for the next block token.
        tokenStack = [];
        currentBlockToken = null;
        currentBlockType = null;
      } else {
        tokenStack.push(token);
      }

      continue;
    }

    const openTypeMatchArr = type.match(/(\w+)_open/);

    if (openTypeMatchArr) {
      currentBlockToken = token;
      currentBlockType = openTypeMatchArr[1];
    } else if (type === 'fence') {
      parsed.push(parseCodeFence(token));
    } else if (type === 'hr') {
      parsed.push({ type: 'hr', children: [{ text: '' }] });
    } else if (type === 'inline') {
      parsed.push(...parseInline(children));
    }
  }

  return parsed;
}

export const parseMarkdown = (text: string) => {
  const md = new MarkdownIt({ linkify: true, html: true, typographer: true });
  const tokens = md.parse(text, null);
  return toFragment(tokens);
};
