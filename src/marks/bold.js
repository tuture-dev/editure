import React from "react";

const BoldMark = props => {
  return (
    <span {...props.attributes} style={{ fontWeight: "bold" }}>
      {props.children}
    </span>
  );
};

export default BoldMark;
