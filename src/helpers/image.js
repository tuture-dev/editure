import { Transforms, Editor } from "slate";
import imageExtensions from "image-extensions";
import isUrl from "is-url";

import { IMAGE } from "../constants";

export const withImages = editor => {
  const { insertData, isVoid } = editor;

  editor.isVoid = element => {
    return element.type === "image" ? true : isVoid(element);
  };

  editor.insertData = data => {
    const text = data.getData("text/plain");
    const { files } = data;

    if (files && files.length > 0) {
      for (const file of files) {
        const reader = new FileReader();
        const [mime] = file.type.split("/");

        if (mime === "image") {
          reader.addEventListener("load", () => {
            const url = reader.result;
            insertImage(editor, url);
          });

          reader.readAsDataURL(file);
        }
      }
    } else if (isImageUrl(text)) {
      insertImage(editor, text);
    } else {
      insertData(data);
    }
  };

  return editor;
};

export const isImageActive = editor => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === IMAGE
  });

  return !!match;
};

export const toggleImageElement = editor => {
  if (isImageActive(editor)) {
    removeImage(editor);
  } else {
    const url = window.prompt("输入图片链接");

    if (!url) {
      return;
    }

    insertImage(editor, url);
  }
};

export const insertImage = (editor, url) => {
  const text = { text: "" };
  const image = { type: IMAGE, url, children: [text] };
  Transforms.insertNodes(editor, image);
};

export const removeImage = editor => {
  Transforms.removeNodes(editor, { match: n => n.type === IMAGE });
};

const isImageUrl = url => {
  if (!url) return false;
  if (!isUrl(url)) return false;

  const ext = new URL(url).pathname.split(".").pop();
  return imageExtensions.includes(ext);
};
