import React from "react";

const DefaultElement = props => {
  return <p {...props.attributes}>{props.children}</p>;
};

export default DefaultElement;
