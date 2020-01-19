import React from "react";

const CodeBlockElement = props => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  );
};

export default CodeBlockElement;
