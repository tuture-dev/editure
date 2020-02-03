import React from "react";
import { Editor, Transforms } from "slate";
import { useSlate } from "slate-react";

import Icon from "./Icon";
import Button from "./Button";
import { isMarkActive, toggleMark } from "../marks";
import { LINK } from "../constants";
import { updateLinkText, startEditLink } from "../utils/link";

const LinkButton = React.forwardRef(({ dispatch }, ref) => {
  const editor = useSlate();

  const onClick = () => {
    const { selection } = editor;
    if (!selection) {
      return;
    }

    if (isMarkActive(editor, LINK)) {
      const [match] = Editor.nodes(editor, { match: n => n.link });

      // 选中当前整个链接，取消链接
      if (match) {
        const { path } = selection.anchor;
        const linkRange = {
          anchor: { path, offset: 0 },
          focus: { path, offset: match[0].text.length }
        };

        Transforms.select(editor, linkRange);
        toggleMark(editor, LINK);
        Transforms.select(editor, selection);
      }
      return;
    }

    dispatch(updateLinkText(Editor.string(editor, selection)));
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
