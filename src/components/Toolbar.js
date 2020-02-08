import React from "react";
import { cx, css } from "emotion";

import Menu from "./Menu";
import MarkButton from "./MarkButton";
import BlockButton from "./BlockButton";
import ImageButton from "./ImageButton";
import HrButton from "./HrButton";
import NoteButton from "./NoteButton";
import LinkButton from "./LinkButton";
import HistoryButton from "./HistoryButton";
import {
  BOLD,
  ITALIC,
  UNDERLINE,
  CODE,
  STRIKETHROUGH,
  H1,
  H2,
  CODE_BLOCK,
  BLOCK_QUOTE,
  BULLETED_LIST,
  NUMBERED_LIST
} from "../constants";

const Toolbar = React.forwardRef(({ className, linkDispatch, ...props }, ref) => {
  const { imageBtnRef, linkBtnRef } = ref;
  return (
    <Menu
      {...props}
      className={cx(
        className,
        css`
          position: relative;
          padding: 1px 18px 17px;
          margin: 0 -20px;
          border-bottom: 2px solid #eee;
          margin-bottom: 20px;
        `
      )}>
      <HistoryButton icon="undo" status="undo" title="撤销" />
      <HistoryButton icon="redo" status="redo" title="重做" />
      <MarkButton format={BOLD} icon="format_bold" title="加粗" />
      <MarkButton format={ITALIC} icon="format_italic" title="斜体" />
      <MarkButton format={UNDERLINE} icon="format_underlined" title="下划线" />
      <MarkButton format={STRIKETHROUGH} icon="format_strikethrough" title="删除线" />
      <MarkButton format={CODE} icon="code" title="内联代码" />
      <LinkButton dispatch={linkDispatch} ref={linkBtnRef} />
      <BlockButton format={H1} icon="looks_one" title="一级标题" />
      <BlockButton format={H2} icon="looks_two" title="二级标题" />
      <BlockButton format={BLOCK_QUOTE} icon="format_quote" title="引用" />
      <BlockButton format={CODE_BLOCK} icon="attach_money" title="代码块" />
      <NoteButton />
      <BlockButton format={NUMBERED_LIST} icon="format_list_numbered" title="有序列表" />
      <BlockButton format={BULLETED_LIST} icon="format_list_bulleted" title="无序列表" />
      <ImageButton ref={imageBtnRef} />
      <HrButton />
    </Menu>
  );
});

export default Toolbar;
