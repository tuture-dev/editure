import React from "react";

const DefaultMark = props => {
  return <span {...props.attributes}>{props.children}</span>;
};

export default DefaultMark;
