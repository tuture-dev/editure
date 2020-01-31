import React from "react";
import { cx, css } from "emotion";

const Button = React.forwardRef(
  (
    { className, active, title, reversed, handleMouseDown, handleClick, ...props },
    ref
  ) => (
    <span
      {...props}
      ref={ref}
      title={title}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      className={cx(
        className,
        css`
          cursor: pointer;
          color: ${reversed ? (active ? "white" : "#aaa") : active ? "black" : "#ccc"};
        `
      )}
    />
  )
);

export default Button;
