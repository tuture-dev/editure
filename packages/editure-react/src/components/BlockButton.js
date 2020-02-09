import React from "react";
import { useSlate } from "slate-react";
import { isBlockActive, toggleBlock } from "editure";

import Icon from "./Icon";
import Button from "./Button";

const BlockButton = ({ format = "", title, icon }) => {
  const editor = useSlate();

  return (
    <Button
      title={title}
      active={isBlockActive(editor, format)}
      handleMouseDown={event => {
        event.preventDefault();
        toggleBlock(editor, format, {}, { unwrap: true });
      }}>
      <Icon>{icon}</Icon>
    </Button>
  );
};

export default BlockButton;
