import React from "react";

const LinkElement = props => {
  return (
    <a {...props.attributes} href={props.element.url}>
      {props.children}
    </a>
  );
};

export default LinkElement;
