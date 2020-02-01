import { jsx } from "slate-hyperscript";
import { Transforms } from "slate";
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
  PARAGRAPH
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
  P: () => ({ type: PARAGRAPH }),
  PRE: () => ({ type: BLOCK_QUOTE }),
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
  let parent = el;

  if (nodeName === "PRE" && el.childNodes[0] && el.childNodes[0].nodeName === "CODE") {
    parent = el.childNodes[0];
  }

  const children = Array.from(parent.childNodes)
    .map(deserialize)
    .flat();

  if (el.nodeName === "BODY") {
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
  const { insertData, isInline, isVoid } = editor;

  editor.isInline = element => {
    return element.type === LINK ? true : isInline(element);
  };

  editor.isVoid = element => {
    return element.type === IMAGE ? true : isVoid(element);
  };

  editor.insertData = data => {
    console.log("insertData", data);
    data.types.forEach(type => {
      console.log("type", type);
      console.log("data", data.getData(type));
    });
    const html = data.getData("text/html");

    if (html) {
      const parsed = new DOMParser().parseFromString(html, "text/html");
      const fragment = deserialize(parsed.body);
      Transforms.insertFragment(editor, fragment);
      return;
    }

    insertData(data);
  };

  return editor;
};
