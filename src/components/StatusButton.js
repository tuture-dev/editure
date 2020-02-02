import React from "react";
import { useSlate } from "slate-react";

import Icon from "./Icon";
import Button from "./Button";
import { REDO, UNDO } from "../constants";

const StatusButton = ({ status = UNDO, title, icon }) => {
  const editor = useSlate();

  return (
    <Button
      title={title}
      handleMouseDown={event => {
        event.preventDefault();

        switch (status) {
          case REDO: {
            editor.redo();

            break;
          }

          case UNDO: {
            editor.undo();

            break;
          }
        }
      }}>
      <Icon>{icon}</Icon>
    </Button>
  );
};

export default StatusButton;
