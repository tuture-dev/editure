import React from "react";
import Modal from "react-modal";
import { Transforms } from "slate";
import { useSlate } from "slate-react";

import { isMarkActive } from "../marks";
import { LINK } from "../constants";
import { getLastSelection } from "../utils/selection";
import {
  updateLinkText,
  updateLinkUrl,
  finishEditLink,
  insertNewLink,
  updateCurrentLink
} from "../utils/link";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)"
  }
};

const EditLink = ({ link, dispatch }) => {
  const editor = useSlate();
  const { isEditing, text, url } = link;

  const onSubmit = e => {
    e.preventDefault();

    // 回到上次编辑的光标位置
    const selection = getLastSelection();
    Transforms.select(editor, selection);

    if (text) {
      if (!isMarkActive(editor, LINK)) {
        insertNewLink(editor, text, url);
      } else {
        updateCurrentLink(editor, text, url);
      }
    }

    dispatch(finishEditLink());
  };

  return (
    <Modal
      isOpen={isEditing}
      style={customStyles}
      ariaHideApp={false}
      shouldCloseOnEsc={true}>
      <p>文本</p>
      <input
        type="text"
        value={text}
        placeholder="添加描述"
        autoFocus={!text}
        onChange={e => dispatch(updateLinkText(e.target.value))}
      />
      <p>链接</p>
      <input
        type="text"
        value={url}
        placeholder="链接地址"
        autoFocus={text}
        onChange={e => dispatch(updateLinkUrl(e.target.value))}
      />
      <button onClick={onSubmit}>确定</button>
    </Modal>
  );
};

export default EditLink;
