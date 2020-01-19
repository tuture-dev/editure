import React from "react";

const CodeMark = props => {
  return <code {...props.attributes}>{props.children}</code>;
};

export default CodeMark;
