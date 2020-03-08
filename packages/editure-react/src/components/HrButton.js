import React from 'react';
import { useSlate } from 'tuture-slate-react';
import { insertVoid } from 'editure';
import { HR } from 'editure-constants';

import Icon from './Icon';
import Button from './Button';

const HrButton = () => {
  const editor = useSlate();

  const onMouseDown = event => {
    event.preventDefault();
    insertVoid(editor, HR);
  };

  return (
    <Button title="分割线" handleMouseDown={onMouseDown}>
      <Icon>remove</Icon>
    </Button>
  );
};

export default HrButton;
