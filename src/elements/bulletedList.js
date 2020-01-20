import React from "react";

const BulletedListElement = ({ attributes, children }) => {
  return <ul {...attributes}>{children}</ul>;
};

export default BulletedListElement;
