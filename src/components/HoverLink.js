import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { css } from "emotion";
import { Editor, Transforms } from "slate";
import { useSlate } from "slate-react";

import Icon from "./Icon";
import { isMarkActive, toggleMark } from "../marks";
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

    const domSelection = window.getSelection();
    const domRange = domSelection.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();

    if (rect.top && rect.left) {
      const [match] = Editor.nodes(editor, { match: n => n.link });
      if (match) {
        setUrl(match[0].url);
      }

      el.style.opacity = 1;
      el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`;
      el.style.left = `${rect.left +
        window.pageXOffset -
        el.offsetWidth / 2 +
        rect.width / 2}px`;
    }
  });

  const onClickEdit = e => {
    e.preventDefault();

    // 点击编辑，隐藏此组件
    const el = ref.current;
    el.removeAttribute("style");

    dispatch(startEditLink());

    const [match] = Editor.nodes(editor, { match: n => n.link });
    if (match) {
      dispatch(updateLinkText(match[0].text));
      dispatch(updateLinkUrl(match[0].url));
    }
  };

  const onDeleteLink = e => {
    e.preventDefault();

    const { selection } = editor;
    const [match] = Editor.nodes(editor, { match: n => n.link });

    // 选中当前整个链接，取消链接
    if (match) {
      const { path } = selection.anchor;
      const linkRange = {
        anchor: { path, offset: 0 },
        focus: { path, offset: match[0].text.length }
      };

      Transforms.select(editor, linkRange);
      toggleMark(editor, LINK);
      Transforms.collapse(editor, {
        edge: "focus"
      });
    }
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
