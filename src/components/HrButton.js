import React from "react";
import { useSlate } from "slate-react";

import Icon from "./Icon";
import Button from "./Button";
import { HR } from "../constants";
import { insertVoid } from "../helpers";

const HrButton = () => {
  const editor = useSlate();

  const onMouseDown = event => {
    event.preventDefault();
    insertVoid(editor, HR);
  };

  return (
    <Button title="分割线" handleMouseDown={onMouseDown}>
      <Icon>remove</Icon>
    </Button>
  );
};

export default HrButton;
