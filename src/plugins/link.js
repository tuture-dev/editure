import { Transforms, Editor, Range } from "slate";
import isUrl from "is-url";

import { LINK } from "../constants";

export const withLinks = editor => {
  const { insertData, insertText, isInline } = editor;

  editor.isInline = element => {
    return element.type === LINK ? true : isInline(element);
  };

  editor.insertText = text => {
    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      insertText(text);
    }
  };

  editor.insertData = data => {
    const text = data.getData("text/plain");

    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      insertData(data);
    }
  };

  return editor;
};

export const isLinkActive = editor => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === LINK
  });

  return !!match;
};

export const toggleLinkElement = editor => {
  if (isLinkActive(editor)) {
    unwrapLink(editor);
  } else {
    const url = window.prompt("输入链接");

    if (!url) {
      return;
    }

    wrapLink(editor, url);
  }
};

export const unwrapLink = editor => {
  if (!editor.selection) {
    return;
  }

  Transforms.unwrapNodes(editor, { match: n => n.type === LINK });
};

export const wrapLink = (editor, url) => {
  if (!editor.selection) {
    return;
  }

  if (isLinkActive(editor)) {
    unwrapLink(editor);
  }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const link = {
    type: LINK,
    url,
    children: isCollapsed ? [{ text: url }] : []
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, link);
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: "end" });
  }
};
