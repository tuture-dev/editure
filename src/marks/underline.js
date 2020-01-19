import React from "react";

const UnderlineMark = props => {
  return (
    <span {...props.attributes} style={{ textDecoration: "underline" }}>
      {props.children}
    </span>
  );
};

export default UnderlineMark;
