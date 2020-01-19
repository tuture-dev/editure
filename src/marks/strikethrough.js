import React from "react";

const StrikethroughMark = props => {
  return (
    <span {...props.attributes} style={{ textDecoration: "line-through" }}>
      {props.children}
    </span>
  );
};

export default StrikethroughMark;
