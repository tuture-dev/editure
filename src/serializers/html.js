import escapeHtml from "escape-html";
import { Text } from "slate";
import { jsx } from "slate-hyperscript";

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
  LIST_ITEM,
  PARAGRAPH,
  CODE_BLOCK,
  CODE_LINE
} from "../constants";

const MARK_DECORATORS = {
  [CODE]: node => ({ ...node, text: `<code>${node.text}</code>` }),
  [BOLD]: node => ({ ...node, text: `<strong>${node.text}</strong>` }),
  [ITALIC]: node => ({ ...node, text: `<em>${node.text}</em>` }),
  [STRIKETHROUGH]: node => ({
    ...node,
    text: `<span style="text-decoration: line-through">${node.text}</span>`
  }),
  [UNDERLINE]: node => ({ ...node, text: `<u>${node.text}</u>` }),
  [LINK]: node => ({
    ...node,
    text: `<a href="${escapeHtml(node.url)}">${node.text}</a>`
  })
};

const joinChildren = node => node.children.map(n => serialize(n)).join("");

const BLOCK_CONVERTERS = {
  [H1]: node => `<h1>${joinChildren(node)}</h1>`,
  [H2]: node => `<h2>${joinChildren(node)}</h2>`,
  [H3]: node => `<h3>${joinChildren(node)}</h3>`,
  [H4]: node => `<h4>${joinChildren(node)}</h4>`,
  [H5]: node => `<h5>${joinChildren(node)}</h5>`,
  [PARAGRAPH]: node => `<p>${joinChildren(node)}</p>`,
  [IMAGE]: node => `<img src="${escapeHtml(node.url)}" alt="" />`,
  [HR]: () => "<hr />",
  [BLOCK_QUOTE]: node => `<blockquote>${joinChildren(node)}</blockquote>`,
  [NOTE]: node => `<blockquote>${joinChildren(node)}</blockquote>`,
  [BULLETED_LIST]: node => {
    const { children } = node;
    const items = children.map(item => `<li>${item.children[0].text}</li>`);
    return `<ul>${items.join("")}</ul>`;
  },
  [NUMBERED_LIST]: node => {
    const { children } = node;
    const items = children.map(item => `<li>${item.children[0].text}</li>`);
    return `<ol>${items.join("")}</ol>`;
  },
  [CODE_BLOCK]: node => {
    const { children } = node;
    const codeLines = children.map(line => `<code>${line.children[0].text}</code>`);
    return `<pre>${codeLines.join("")}</pre>`;
  }
};

const ELEMENT_TAGS = {
  BLOCKQUOTE: () => ({ type: BLOCK_QUOTE }),
  H1: () => ({ type: H1 }),
  H2: () => ({ type: H2 }),
  H3: () => ({ type: H3 }),
  H4: () => ({ type: H4 }),
  H5: () => ({ type: H5 }),
  H6: () => ({ type: PARAGRAPH }),
  HR: () => ({ type: HR }),
  IMG: el => ({ type: IMAGE, url: el.getAttribute("src") }),
  LI: el => ({
    type: LIST_ITEM,
    parent: el.parentNode.nodeName === "UL" ? BULLETED_LIST : NUMBERED_LIST
  }),
  OL: () => ({ type: NUMBERED_LIST }),
  P: () => ({ type: PARAGRAPH }),
  DIV: () => ({ type: PARAGRAPH }),
  PRE: () => ({ type: CODE_BLOCK }),
  UL: () => ({ type: BULLETED_LIST })
};

// COMPAT: `B` is omitted here because Google Docs uses `<b>` in weird ways.
const TEXT_TAGS = {
  A: el => ({ link: true, url: el.getAttribute("href") }),
  CODE: () => ({ code: true }),
  DEL: () => ({ strikethrough: true }),
  EM: () => ({ italic: true }),
  I: () => ({ italic: true }),
  S: () => ({ strikethrough: true }),
  STRONG: () => ({ bold: true }),
  U: () => ({ underline: true })
};

const serialize = node => {
  if (Text.isText(node)) {
    const markedNode = Object.keys(MARK_DECORATORS).reduce(
      (decoratedNode, currentMark) => {
        return node[currentMark]
          ? MARK_DECORATORS[currentMark](decoratedNode)
          : decoratedNode;
      },
      { ...node, text: escapeHtml(node.text) }
    );

    return markedNode.text;
  }

  const converter = BLOCK_CONVERTERS[node.type];
  if (typeof converter === "function") {
    return converter(node);
  }

  return joinChildren(node, "");
};

const deserialize = el => {
  if (el.nodeType === 3) {
    return el.textContent;
  } else if (el.nodeType !== 1) {
    return null;
  } else if (el.nodeName === "BR") {
    return jsx("element", { type: PARAGRAPH }, [{ text: "" }]);
  }

  const { nodeName } = el;

  if (nodeName === "PRE") {
    const attrs = ELEMENT_TAGS["PRE"]();

    try {
      return jsx(
        "element",
        attrs,
        Array.from(el.childNodes).map(child =>
          jsx("element", { type: CODE_LINE }, [{ text: child.textContent }])
        )
      );
    } catch {
      return jsx("element", attrs, [
        jsx("element", CODE_LINE, [{ text: el.textContent }])
      ]);
    }
  }

  const children = Array.from(el.childNodes)
    .map(deserialize)
    .flat();

  // Ensure that children is not empty.
  if (children.length === 0) {
    children.push({ text: "" });
  }

  if (nodeName === "BODY") {
    return jsx("fragment", {}, children);
  }

  if (["P", "DIV"].includes(nodeName)) {
    // If any child is a block, return all children directly without adding any type.
    for (const child of children) {
      if (child.type) {
        return children;
      }
    }
  }

  if (ELEMENT_TAGS[nodeName]) {
    const attrs = ELEMENT_TAGS[nodeName](el);
    return jsx("element", attrs, children);
  }

  if (TEXT_TAGS[nodeName]) {
    const attrs = TEXT_TAGS[nodeName](el);
    return children.map(child => jsx("text", attrs, child));
  }

  return children;
};

export const serializeToHtml = serialize;

export const deserializeFromHtml = text => {
  const parsed = new DOMParser().parseFromString(text, "text/html");
  return deserialize(parsed.body);
};
