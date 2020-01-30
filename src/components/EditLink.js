import React, { useState } from "react";
import Modal from "react-modal";
import { Editor, Transforms } from "slate";
import { useSlate } from "slate-react";

import { toggleMark, isMarkActive } from "../marks";
import { LINK } from "../constants";
import { getLastSelection } from "../utils/selection";
import { updateLinkText, updateLinkUrl, finishEditLink } from "../utils/link";

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
      const { anchor } = selection;

      if (!isMarkActive(editor, LINK)) {
        // 如果当前不是 link，则插入新的 link 文本，并加上相应的 mark
        const focus = { ...anchor, offset: anchor.offset + text.length };
        const range = { anchor, focus };

        Transforms.insertText(editor, text);
        Transforms.select(editor, range);
        toggleMark(editor, LINK);
      } else {
        // 否则修改当前 link 的文本
        const { path } = anchor;
        const focus = { path, offset: text.length };
        const range = { anchor: { path, offset: 0 }, focus };
        Transforms.select(editor, range);
        Transforms.insertText(editor, text);
      }

      Transforms.setNodes(editor, { url }, { match: n => n.link });
      Transforms.collapse(editor, { edge: "end" });

      toggleMark(editor, LINK);
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
        onChange={e => dispatch(updateLinkText(e.target.value))}
      />
      <p>链接</p>
      <input
        type="text"
        value={url}
        onChange={e => dispatch(updateLinkUrl(e.target.value))}
      />
      <button onClick={onSubmit}>确定</button>
    </Modal>
  );
};

export default EditLink;
