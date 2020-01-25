import React from "react";
import { useSlate } from "slate-react";

import Icon from "./Icon";
import Button from "./Button";

const BlockButton = ({
  format = "",
  title,
  icon,
  toggleBlock,
  isBlockActive
}) => {
  const editor = useSlate();

  return (
    <Button
      title={title}
      active={isBlockActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};

export default BlockButton;
