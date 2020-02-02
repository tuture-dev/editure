import { jsx } from "slate-hyperscript";
import { Transforms, Editor, Element } from "slate";

import { isBlockActive } from "../blocks";
import {
  LINK,
  BLOCK_QUOTE,
  H1,
  H2,
  H3,
  H4,
  H5,
  IMAGE,
  LIST_ITEM,
  NUMBERED_LIST,
  BULLETED_LIST,
  PARAGRAPH,
  CODE_BLOCK,
  CODE_LINE
} from "../constants";
import { getBeforeText } from "../utils";

const ELEMENT_TAGS = {
  BLOCKQUOTE: () => ({ type: BLOCK_QUOTE }),
  H1: () => ({ type: H1 }),
  H2: () => ({ type: H2 }),
  H3: () => ({ type: H3 }),
  H4: () => ({ type: H4 }),
  H5: () => ({ type: H5 }),
  H6: () => ({ type: PARAGRAPH }),
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

export const deserialize = el => {
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

export const withHtml = editor => {
  const { insertData, insertText, isInline, isVoid, normalizeNode } = editor;

  editor.isInline = element => {
    return element.type === LINK ? true : isInline(element);
  };

  editor.isVoid = element => {
    return element.type === IMAGE ? true : isVoid(element);
  };

  editor.insertData = data => {
    if (data.types.length === 1 && data.types[0] === "text/plain") {
      return insertText(data.getData("text/plain"));
    }

    const { selection } = editor;
    const { beforeText } = getBeforeText(editor);
    console.log("beforeText", beforeText);

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

    const html = data.getData("text/html");

    if (html) {
      const parsed = new DOMParser().parseFromString(html, "text/html");
      console.log("parsed", parsed.body);
      const fragment = deserialize(parsed.body);
      console.log("fragment", fragment);
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
};
