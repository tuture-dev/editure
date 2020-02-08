import isUrl from "is-url";

import { LINK } from "../constants";
import { insertLink } from "../helpers";

export const withLinks = editor => {
  const { insertData, insertText, isInline } = editor;

  editor.isInline = element => {
    return element.type === LINK ? true : isInline(element);
  };

  editor.insertText = text => {
    if (text && isUrl(text)) {
      insertLink(editor, text, text);
    } else {
      insertText(text);
    }
  };

  editor.insertData = data => {
    const text = data.getData("text/plain");

    if (text && isUrl(text)) {
      insertLink(editor, text, text);
    } else {
      insertData(data);
    }
  };

  return editor;
};
