import { Editor, Transforms } from "slate";

import { IMAGE } from "../constants";
import { getBeforeText } from "./index";

const IMAGE_HOSTING_URL = "https://imgkr.com/api/files/upload";

export const uploadImage = (file, callback) => {
  const data = new FormData();
  data.append("file", file);

  // 开发时推荐取消下一行的注释，同时注释下面整个 fetch 语句
  // callback(null, "https://tuture.co/images/covers/cd44c84.jpg");

  fetch(IMAGE_HOSTING_URL, {
    method: "POST",
    body: data
  })
    .then(res => res.json())
    .then(resObj => callback(null, resObj.data))
    .catch(err => callback(err));
};

export const createInsertImageCallback = editor => {
  return (err, url) => {
    if (err) return alert("图片上传失败，请检查网络连接并重新尝试");

    const { beforeText } = getBeforeText(editor);

    if (beforeText) {
      Editor.insertBreak(editor);
    }

    const text = { text: "" };
    const image = { type: IMAGE, url, children: [text] };
    Transforms.removeNodes(editor, {
      match: n => n.children && !n.children[0].text
    });
    Transforms.insertNodes(editor, image);
    Transforms.insertNodes(editor, { children: [text] });
  };
};

export const createDropListener = editor => {
  return e => {
    e.preventDefault();
    e.persist();

    const files = e.dataTransfer.files;

    if (files.length === 0 || !/\.(png|jpe?g|bmp|gif)$/.test(files[0].name)) {
      // 无文件，或不是图片
      return;
    }

    uploadImage(files[0], createInsertImageCallback(editor));
  };
};
