import React from "react";
import { useSlate } from "slate-react";

import Icon from "./Icon";
import Button from "./Button";
import { LINK } from "../constants";
import { isMarkActive, removeLink } from "../helpers";
import { getSelectedString } from "../selection";
import { updateLinkText, startEditLink } from "../utils/link";

const LinkButton = React.forwardRef(({ dispatch }, ref) => {
  const editor = useSlate();

  const onClick = () => {
    const { selection } = editor;
    if (!selection) {
      return;
    }

    if (isMarkActive(editor, LINK)) {
      return removeLink(editor);
    }

    dispatch(updateLinkText(getSelectedString(editor)));
    dispatch(startEditLink());
  };

  return (
    <Button
      title="添加链接"
      active={isMarkActive(editor, LINK)}
      handleClick={onClick}
      ref={ref}>
      <Icon>link</Icon>
    </Button>
  );
});

export default LinkButton;
