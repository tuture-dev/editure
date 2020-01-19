import React from "react";

const ItalicMark = props => {
  return <i {...props.attributes}>{props.children}</i>;
};

export default ItalicMark;
