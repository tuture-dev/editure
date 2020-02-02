import isUrl from "is-url";

import { LINK } from "../constants";
import { insertNewLink } from "../utils/link";

export const withLinks = editor => {
  const { insertData, insertText, isInline } = editor;

  editor.isInline = element => {
    return element.type === LINK ? true : isInline(element);
  };

  editor.insertText = text => {
    if (text && isUrl(text)) {
      insertNewLink(editor, text, text);
    } else {
      insertText(text);
    }
  };

  editor.insertData = data => {
    console.log("insertData", data);
    data.types.forEach(type => {
      console.log("type", type);
      console.log("data", data.getData(type));
    });

    const text = data.getData("text/plain");

    if (text && isUrl(text)) {
      insertNewLink(editor, text, text);
    } else {
      // insertText(text);
      insertData(data);
    }
  };

  return editor;
};
