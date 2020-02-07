import React, { useRef } from "react";
import Modal from "react-modal";
import { Transforms } from "slate";
import { useSlate } from "slate-react";
import { css } from "emotion";

import { isMarkActive } from "../helpers";
import { LINK } from "../constants";
import { getLastSelection } from "../utils/selection";
import {
  updateLinkText,
  updateLinkUrl,
  finishEditLink,
  insertNewLink,
  updateCurrentLink,
  cancelEditLink
} from "../utils/link";

const customStyles = {
  content: {
    width: "400px",
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
  const ref = useRef(null);
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

  const onCancel = e => {
    e.preventDefault();

    // 回到上次编辑的光标位置
    const selection = getLastSelection();
    Transforms.select(editor, selection);

    dispatch(cancelEditLink());
  };

  const onKeyDown = e => {
    if (e.keyCode === 13) {
      onSubmit(e);
    }
  };

  return (
    <Modal
      isOpen={isEditing}
      style={customStyles}
      ariaHideApp={false}
      shouldCloseOnEsc={true}>
      <p
        className={css`
          margin-top: 8px;
          margin-bottom: 8px;
        `}>
        文本
      </p>
      <input
        type="text"
        value={text}
        placeholder="添加描述"
        autoFocus={!text}
        onKeyDown={onKeyDown}
        onChange={e => dispatch(updateLinkText(e.target.value))}
      />
      <p
        className={css`
          margin-top: 8px;
          margin-bottom: 8px;
        `}>
        链接
      </p>
      <input
        ref={ref}
        type="text"
        value={url}
        placeholder="链接地址"
        autoFocus={text}
        onKeyDown={onKeyDown}
        onChange={e => dispatch(updateLinkUrl(e.target.value))}
      />
      <div
        className={css`
          margin-top: 16px;
        `}>
        <button
          className={css`
            width: 60px;
          `}
          onClick={onSubmit}>
          确定
        </button>
        <span
          className={css`
            display: inline-block;
            width: 32px;
          `}>
          {" "}
        </span>
        <button
          className={css`
            width: 60px;
          `}
          onClick={onCancel}>
          取消
        </button>
      </div>
    </Modal>
  );
};

export default EditLink;
