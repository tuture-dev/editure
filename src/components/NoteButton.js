import React, { useState } from "react";
import { useSlate } from "slate-react";
import { css } from "emotion";

import Icon from "./Icon";
import Button from "./Button";
import { levels, insertNote } from "../utils/note";

const NoteButton = () => {
  const editor = useSlate();
  const [showDropList, setShowDropList] = useState(false);

  const handleClickItem = (e, level) => {
    e.preventDefault();
    insertNote(editor, level);
  };

  return (
    <Button
      title="提示框"
      onMouseEnter={() => setShowDropList(true)}
      onMouseLeave={() => setShowDropList(false)}>
      <Icon>note_add</Icon>
      {showDropList && (
        <div
          className={css`
            color: black;
            display: block;
            position: absolute;
            z-index: 2;
            min-width: 20px;
            padding: 10px 0;
            text-align: center;
            background-color: #fff;
            border: 1px solid #f1f1f1;
            border-right-color: #ddd;
            border-bottom-color: #ddd;
          `}
          onClick={() => setShowDropList(false)}>
          <ul
            className={css`
              margin: 0;
              padding: 0;
              padding-inline-start: 0;
              list-style-type: none;
            `}>
            {levels.map(level => {
              return (
                <li
                  key={level}
                  className={css`
                    width: 100px;
                    box-sizing: border-box;
                    padding: 5px 0;
                    &:hover {
                      background: #f1f1f1;
                    }
                  `}>
                  <span onClick={e => handleClickItem(e, level)}>{level}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Button>
  );
};

export default NoteButton;
