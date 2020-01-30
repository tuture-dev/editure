import React, { useEffect } from "react";
import { Editor, Transforms } from "slate";
import { useSlate } from "slate-react";

import Icon from "./Icon";
import Button from "./Button";
import { isMarkActive, toggleMark } from "../marks";
import { LINK } from "../constants";
import { getLastSelection } from "../utils/selection";
import { updateLinkText, startEditLink } from "../utils/link";

const LinkButton = ({ dispatch }) => {
  const editor = useSlate();

  const onClick = e => {
    e.preventDefault();

    const { selection } = editor;

    dispatch(updateLinkText(Editor.string(editor, selection)));
    dispatch(startEditLink());
  };

  return (
    <Button title="添加链接" active={isMarkActive(editor, LINK)} onMouseDown={onClick}>
      <Icon>link</Icon>
    </Button>
  );
};

export default LinkButton;
