import React from "react";
import { useSlate } from "slate-react";

import { isMarkActive, toggleMark } from "../marks";
import Icon from "./Icon";
import Button from "./Button";

const MarkButton = ({ format = "", icon, title }) => {
  const editor = useSlate();

  return (
    <Button
      title={title}
      active={isMarkActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};

export default MarkButton;
