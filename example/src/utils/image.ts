import { message } from 'antd';
import { IMAGE } from 'editure-constants';
import { Editor } from 'editure';
import { ReactEditor } from 'editure-react';

const IMAGE_HOSTING_URL = 'https://imgkr.com/api/files/upload';

export const uploadImage = (file: File, callback: (err?: Error | null, url?: string) => void) => {
  const data = new FormData();
  data.append('file', file);

  fetch(IMAGE_HOSTING_URL, {
    method: 'POST',
    body: data,
  })
    .then((res) => {
      if (res.status !== 200) {
        throw new Error(res.statusText);
      }
      return res.json();
    })
    .then((data) => {
      console.log('data', data);
      if (!data.success) {
        throw new Error('上传失败，请重试！');
      }
      callback(null, data.data);
    })
    .catch((err: Error) => callback(err));
};

export const createInsertImageCallback = (editor: Editor) => (err?: Error | null, url?: string) => {
  if (err) {
    return message.error(String(err));
  }

  editor.insertVoid(IMAGE, { url });
};

export const createDropListener = (editor: Editor) => (e: React.DragEvent) => {
  e.preventDefault();
  e.persist();

  const { files } = e.dataTransfer;

  if (files.length === 0 || !/\.(png|jpe?g|bmp|gif)$/.test(files[0].name)) {
    // No file, or not an image.
    return;
  }

  uploadImage(files[0], createInsertImageCallback(editor));
};

export const withImages = (editor: Editor & ReactEditor) => {
  const { insertData, isVoid } = editor;

  editor.isVoid = (element) => (element.type === IMAGE ? true : isVoid(element));

  editor.insertData = (data) => {
    const { files } = data;

    if (files && files.length > 0) {
      uploadImage(files[0], createInsertImageCallback(editor));
    } else {
      insertData(data);
    }
  };

  return editor;
};
