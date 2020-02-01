import { jsx } from "slate-hyperscript";
import { Transforms, Editor } from "slate";
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

const ELEMENT_TAGS = {
  BLOCKQUOTE: () => ({ type: BLOCK_QUOTE }),
  H1: () => ({ type: H1 }),
  H2: () => ({ type: H2 }),
  H3: () => ({ type: H3 }),
  H4: () => ({ type: H4 }),
  H5: () => ({ type: H5 }),
  // H6: () => ({ type: "heading-six" }),
  IMG: el => ({ type: IMAGE, url: el.getAttribute("src") }),
  LI: () => ({ type: LIST_ITEM }),
  OL: () => ({ type: NUMBERED_LIST }),
  DIV: () => ({ type: PARAGRAPH }),
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
    return jsx(
      "element",
      attrs,
      Array.from(el.childNodes).map(child =>
        jsx("element", { type: CODE_LINE }, [{ text: child.innerText }])
      )
    );
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
  const { insertData, insertText, isInline, isVoid } = editor;

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

    const html = data.getData("text/html");

    if (html) {
      const parsed = new DOMParser().parseFromString(html, "text/html");
      console.log("parsed", parsed.body);
      const fragment = deserialize(parsed.body);
      console.log("fragment", fragment);
      // fragment.forEach(node => Transforms.insertNodes(editor, node));
      Transforms.insertNodes(editor, fragment);
      Transforms.select(editor, Editor.end(editor, []));
      // Transforms.insertFragment(editor, fragment);
      return;
    }

    insertData(data);
  };

  return editor;
};
