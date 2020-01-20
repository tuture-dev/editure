import React from "react";

const BlockquoteElement = ({ attributes, children }) => {
  return <blockquote {...attributes}>{children}</blockquote>;
};

export default BlockquoteElement;
