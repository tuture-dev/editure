import React from "react";

const ListItemElement = ({ attributes, children }) => {
  return <li {...attributes}>{children}</li>;
};

export default ListItemElement;
