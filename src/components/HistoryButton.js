import React from "react";
import { useSlate } from "slate-react";

import Icon from "./Icon";
import Button from "./Button";

const HistoryButton = ({ action = "undo", title, icon }) => {
  const editor = useSlate();

  return (
    <Button
      title={title}
      handleMouseDown={event => {
        event.preventDefault();

        switch (action) {
          case "redo": {
            editor.redo();
            break;
          }

          case "undo": {
            editor.undo();
            break;
          }

          default: {
            return;
          }
        }
      }}>
      <Icon>{icon}</Icon>
    </Button>
  );
};

export default HistoryButton;
