import React from "react";

const UnderlineMark = props => {
  return <u {...props.attributes}>{props.children}</u>;
};

export default UnderlineMark;
