import { insertVoid } from "editure";
import { IMAGE } from "editure-constants";

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
    insertVoid(editor, IMAGE, { url });
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

export const withImages = editor => {
  const { insertData, isVoid } = editor;

  editor.isVoid = element => {
    return element.type === IMAGE ? true : isVoid(element);
  };

  editor.insertData = data => {
    const { files } = data;

    if (files && files.length > 0) {
      uploadImage(files[0], createInsertImageCallback(editor));
    } else {
      insertData(data);
    }
  };

  return editor;
};