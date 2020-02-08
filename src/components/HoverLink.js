import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { css } from "emotion";
import { useSlate } from "slate-react";

import Icon from "./Icon";
import { isMarkActive, removeLink, getLinkData } from "../helpers";
import { LINK } from "../constants";
import { startEditLink, updateLinkText, updateLinkUrl } from "../utils/link";

const Portal = ({ children }) => {
  return ReactDOM.createPortal(children, document.body);
};

const HoverLink = ({ dispatch }) => {
  const [url, setUrl] = useState("");
  const ref = useRef(null);
  const editor = useSlate();

  // eslint-disable-next-line
  useEffect(() => {
    const el = ref.current;

    if (!el) {
      return;
    }

    if (!editor.selection || !isMarkActive(editor, LINK)) {
      el.removeAttribute("style");
      return;
    }

    setUrl(getLinkData(editor).url);

    const domSelection = window.getSelection();
    const domRange = domSelection.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();

    el.style.opacity = 1;
    el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`;
    el.style.left = `${rect.left +
      window.pageXOffset -
      el.offsetWidth / 2 +
      rect.width / 2}px`;
  });

  const onClickEdit = e => {
    e.preventDefault();

    // 点击编辑，隐藏此组件
    const el = ref.current;
    el.removeAttribute("style");

    dispatch(startEditLink());

    const { text, url } = getLinkData(editor);
    text && dispatch(updateLinkText(text));
    url && dispatch(updateLinkUrl(url));
  };

  const onDeleteLink = e => {
    e.preventDefault();
    removeLink(editor);
  };

  return (
    <Portal>
      <div
        ref={ref}
        className={css`
          padding: 8px 7px 6px;
          position: absolute;
          z-index: 1;
          top: 10000px;
          left: -20000px;
          margin-top: -6px;
          opacity: 0;
          border: 1px solid black;
          background-color: #eee;
          border-radius: 4px;
          transition: opacity 0.75s;
        `}>
        <a href={url} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
        <span> </span>
        <Icon onMouseDown={onClickEdit}>edit</Icon>
        <span> </span>
        <Icon onMouseDown={onDeleteLink}>delete</Icon>
      </div>
    </Portal>
  );
};

export default HoverLink;
