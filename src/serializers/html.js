import escapeHtml from "escape-html";
import { Text } from "slate";
import { jsx } from "slate-hyperscript";

import {
  BLOCK_QUOTE,
  H1,
  H2,
  H3,
  H4,
  H5,
  HR,
  NOTE,
  IMAGE,
  LIST_ITEM,
  NUMBERED_LIST,
  BULLETED_LIST,
  PARAGRAPH,
  CODE_BLOCK,
  CODE_LINE
} from "../constants";

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
  LI: () => ({ type: LIST_ITEM }),
  OL: () => ({ type: NUMBERED_LIST }),
  P: () => ({ type: PARAGRAPH }),
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
    return escapeHtml(node.text);
  }

  const children = node.children.map(n => serialize(n)).join("");

  if (node.bold) {
    return `<strong>${children}</strong>`;
  }

  if (node.code) {
    return `<code>${children}</code>`;
  }

  if (node.italic) {
    return `<em>${children}</em>`;
  }

  if (node.strikethrough) {
    return `<span style="text-decoration: line-through">${children}</span>`;
  }

  if (node.underline) {
    return `<u>${children}</u>`;
  }

  if (node.link) {
    return `<a href="${escapeHtml(node.url)}">${children}</a>`;
  }

  switch (node.type) {
    case H1:
      return `<h1>${children}</h1>`;
    case H2:
      return `<h2>${children}</h2>`;
    case H3:
      return `<h3>${children}</h3>`;
    case H4:
      return `<h4>${children}</h4>`;
    case LIST_ITEM:
      return `<li>${children}</li>`;
    case BULLETED_LIST:
      return `<ul>${children}</ul>`;
    case NUMBERED_LIST:
      return `<ol>${children}</ol>`;
    case CODE_LINE:
      return `<div>${children}</div>`;
    case CODE_BLOCK:
      return `<pre>${children}</pre>`;
    case BLOCK_QUOTE:
      return `<blockquote>${children}</blockquote>`;
    case IMAGE:
      return `<img src=${node.url} alt=${node.url} />`;
    case NOTE:
      return `<blockquote>${children}</blockquote>`;
    case PARAGRAPH:
      return `<p>${children}</p>`;
    case HR:
      return `<hr />`;
    default:
      return children;
  }
};

const deserialize = el => {
  if (el.nodeType === 3) {
    return el.textContent;
  } else if (el.nodeType !== 1) {
    return null;
  } else if (el.nodeName === "BR") {
    return "\n";
  }

  const { nodeName } = el;

  if (nodeName === "PRE") {
    const attrs = ELEMENT_TAGS["PRE"]();

    // 如果检测到 pre -> code 的 DOM 结构，直接取 code 的 innerText 构建代码块
    if (el.childNodes[0] && el.childNodes[0].nodeName === "CODE") {
      return jsx(
        "element",
        attrs,
        el.childNodes[0].innerText
          .slice(0, -1)
          .split("\n")
          .map(line => jsx("element", { type: CODE_LINE }, [{ text: line }]))
      );
    }

    // 否则是 pre -> div 的 DOM 结构，取每个子 div 的 innerText（通常可以认为是一行）
    try {
      return jsx(
        "element",
        attrs,
        Array.from(el.childNodes).map(child =>
          jsx("element", { type: CODE_LINE }, [{ text: child.innerText }])
        )
      );
    } catch {
      return jsx("element", attrs, [jsx("element", CODE_LINE, [{ text: el.innerText }])]);
    }
  }

  const children = Array.from(el.childNodes)
    .map(deserialize)
    .flat();

  if (nodeName === "BODY") {
    return jsx("fragment", {}, children);
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
