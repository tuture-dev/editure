import { IMAGE } from "../constants";
import { uploadImage, createInsertImageCallback } from "../utils/image";

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
