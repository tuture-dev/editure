import React from "react";

const NumberedListElement = ({ attributes, children }) => {
  return <ol {...attributes}>{children}</ol>;
};

export default NumberedListElement;
