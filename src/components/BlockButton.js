import React from "react";
import { useSlate } from "slate-react";

import Icon from "./Icon";
import Button from "./Button";
import { isBlockActive, toggleBlock } from "../helpers";
import { TOOL_BUTTON } from "../constants";

const BlockButton = ({ format = "", title, icon }) => {
  const editor = useSlate();

  return (
    <Button
      title={title}
      active={isBlockActive(editor, format)}
      handleMouseDown={event => {
        event.preventDefault();
        toggleBlock(editor, format, {}, TOOL_BUTTON);
      }}>
      <Icon>{icon}</Icon>
    </Button>
  );
};

export default BlockButton;
