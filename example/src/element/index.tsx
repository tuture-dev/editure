import React from 'react';
import * as F from 'editure-constants';
import { Element } from 'editure';

/** @jsx jsx */
import { css, jsx } from '@emotion/core';

import NoteElement from './Note';
import ImageElement from './Image';
import HrElement from './Hr';
import CodeBlockElement from './CodeBlock';
import ListItemElement from './ListItem';

export type ElementProps = {
  attributes: Record<string, any>;
  children: React.ReactNode;
  element: Element;
};

export default (props: ElementProps) => {
  const { attributes, children, element } = props;

  switch (element.type) {
    case F.BLOCK_QUOTE:
      return (
        <blockquote {...attributes}>
          <div>{children}</div>
        </blockquote>
      );
    case F.LIST_ITEM:
      return <ListItemElement {...props} />;
    case F.BULLETED_LIST:
      return (
        <ul
          {...attributes}
          css={css`
            padding-inline-start: 0;
          `}>
          {children}
        </ul>
      );
    case F.NUMBERED_LIST:
      return (
        <ol
          {...attributes}
          css={css`
            padding-inline-start: 0;
          `}>
          {children}
        </ol>
      );
    case F.H1:
      return (
        <h1 {...attributes} id={element.id}>
          {children}
        </h1>
      );
    case F.H2:
      return (
        <h2 {...attributes} id={element.id}>
          {children}
        </h2>
      );
    case F.H3:
      return (
        <h3 {...attributes} id={element.id}>
          {children}
        </h3>
      );
    case F.H4:
      return (
        <h4 {...attributes} id={element.id}>
          {children}
        </h4>
      );
    case F.H5:
      return (
        <h5 {...attributes} id={element.id}>
          {children}
        </h5>
      );
    case F.CODE_BLOCK:
      return <CodeBlockElement {...props} />;
    case F.CODE_LINE:
      return (
        <tr {...attributes}>
          <td
            css={css`
              white-space: pre;
              display: block;
              color: #fff;
            `}>
            {children}
          </td>
        </tr>
      );
    case F.NOTE:
      return <NoteElement {...props} />;
    case F.IMAGE:
      return <ImageElement {...props} />;
    case F.HR:
      return <HrElement {...props} />;
    default:
      return <p {...attributes}>{children}</p>;
  }
};
