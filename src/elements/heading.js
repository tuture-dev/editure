import React from "react";

export const HeadingOneElement = ({ attributes, children }) => {
  return <h1 {...attributes}>{children}</h1>;
};

export const HeadingTwoElement = ({ attributes, children }) => {
  return <h2 {...attributes}>{children}</h2>;
};

export const HeadingThreeElement = ({ attributes, children }) => {
  return <h3 {...attributes}>{children}</h3>;
};

export const HeadingFourElement = ({ attributes, children }) => {
  return <h4 {...attributes}>{children}</h4>;
};
