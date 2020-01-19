import React from "react";

export const CodeMark = props => {
  return <code {...props.attributes}>{props.children}</code>;
};

export const BoldMark = props => {
  return (
    <span {...props.attributes} style={{ fontWeight: "bold" }}>
      {props.children}
    </span>
  );
};

export const ItalicMark = props => {
  return <i {...props.attributes}>{props.children}</i>;
};

export const UnderlineMark = props => {
  return (
    <span {...props.attributes} style={{ textDecoration: "underline" }}>
      {props.children}
    </span>
  );
};

export const StrikethroughMark = props => {
  return (
    <span {...props.attributes} style={{ textDecoration: "line-through" }}>
      {props.children}
    </span>
  );
};

export const DefaultMark = props => {
  return <span {...props.attributes}>{props.children}</span>;
};
