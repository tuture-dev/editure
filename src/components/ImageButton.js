import React, { useRef } from "react";
import { useSlate } from "slate-react";
import { css } from "emotion";

import Icon from "./Icon";
import Button from "./Button";
import { uploadImage, createInsertImageCallback } from "../utils/image";

const ImageButton = () => {
  const editor = useSlate();
  const inputFile = useRef(null);

  const onChange = e => {
    e.persist();
    uploadImage(e.target.files[0], createInsertImageCallback(editor));
  };

  return (
    <Button title="图片" onClick={() => inputFile.current.click()}>
      <input
        type="file"
        ref={inputFile}
        onChange={onChange}
        className={css`
          position: absolute;
          z-index: -1;
          left: 0;
          top: 0;
          width: 0;
          height: 0;
          opacity: 0;
        `}
      />
      <Icon>image</Icon>
    </Button>
  );
};

export default ImageButton;
