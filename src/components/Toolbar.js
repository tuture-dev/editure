import React from "react";
import { cx, css } from "emotion";

import Menu from "./Menu";
import MarkButton from "./MarkButton";
import BlockButton from "./BlockButton";
import {
  BOLD,
  ITALIC,
  UNDERLINE,
  CODE,
  STRIKETHROUGH,
  H1,
  H2,
  CODE_BLOCK,
  LINK,
  IMAGE,
  BLOCK_QUOTE,
  BULLETED_LIST,
  NUMBERED_LIST,
  HR
} from "../constants";

const Toolbar = React.forwardRef(({ className, ...props }, ref) => (
  <Menu
    {...props}
    ref={ref}
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
    <MarkButton format={BOLD} icon="format_bold" title="加粗" />
    <MarkButton format={ITALIC} icon="format_italic" title="斜体" />
    <MarkButton format={UNDERLINE} icon="format_underlined" title="下划线" />
    <MarkButton format={STRIKETHROUGH} icon="format_strikethrough" title="删除线" />
    <MarkButton format={CODE} icon="code" title="内联代码" />
    <BlockButton format={LINK} icon="link" title="添加链接" />
    <BlockButton format={H1} icon="looks_one" title="一级标题" />
    <BlockButton format={H2} icon="looks_two" title="二级标题" />
    <BlockButton format={BLOCK_QUOTE} icon="format_quote" title="引用" />
    <BlockButton format={CODE_BLOCK} icon="attach_money" title="代码块" />
    <BlockButton format={NUMBERED_LIST} icon="format_list_numbered" title="有序列表" />
    <BlockButton format={BULLETED_LIST} icon="format_list_bulleted" title="无序列表" />
    <BlockButton format={IMAGE} icon="image" title="图片" />
    <BlockButton format={HR} icon="remove" title="分割线" />
  </Menu>
));

export default Toolbar;
