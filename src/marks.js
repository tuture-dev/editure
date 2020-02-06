import React from "react";
import { css } from "emotion";
import { Editor, Transforms, Range } from "slate";

import { isBlockActive } from "./blocks";
import {
  CODE_BLOCK,
  BOLD,
  ITALIC,
  UNDERLINE,
  STRIKETHROUGH,
  CODE,
  LINK,
  PARAGRAPH
} from "./constants";

export const MARK_TYPES = [BOLD, ITALIC, UNDERLINE, STRIKETHROUGH, CODE, LINK];

const Link = ({ attributes, children, url }) => {
  return (
    <a
      className={css`
        &:hover {
          cursor: pointer;
        }
      `}
      {...attributes}
      href={url || "#"}>
      {children}
    </a>
  );
};

export const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

export const detectMarkFormat = (editor, marks = MARK_TYPES) => {
  let realMarks = [];

  for (const mark of marks) {
    if (isMarkActive(editor, mark)) {
      realMarks.push(mark);
    }
  }

  return realMarks;
};

export const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isBlockActive(editor, CODE_BLOCK)) {
    return;
  }

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }

  const { selection, children } = editor;

  // Slate 对首行删除 mark 有问题，这里做一下变通
  if (
    selection &&
    Range.isCollapsed(selection) &&
    children.length === 1 &&
    !children[0].children[0].text
  ) {
    Transforms.insertNodes(editor, {
      type: PARAGRAPH,
      children: [{ text: "" }]
    });
  }
};

export default ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.strikethrough) {
    children = <span style={{ textDecoration: "line-through" }}>{children}</span>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  if (leaf.link) {
    children = (
      <Link {...attributes} url={leaf.url}>
        {children}
      </Link>
    );
  }

  return (
    <span {...attributes} className={leaf.prismToken ? leaf.className : ""}>
      {children}
    </span>
  );
};
