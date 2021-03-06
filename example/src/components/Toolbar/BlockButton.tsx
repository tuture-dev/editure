import React from 'react';
import { useEditure } from 'editure-react';

import Button from './Button';
import ToolbarIcon from './ToolbarIcon';

import { IEditor } from '../../editor';
import { BLOCK_HOTKEYS, getHotkeyHint } from '../../utils/hotkeys';

type BlockButtonProps = {
  format: string;
  icon: string;
};

const BlockButton = ({ format, icon }: BlockButtonProps) => {
  const editor = useEditure() as IEditor;
  const isActive = editor.isBlockActive(format);
  const { hotkey, title } = BLOCK_HOTKEYS[format];

  return (
    <Button
      handleMouseDown={(event: React.SyntheticEvent) => {
        event.preventDefault();
        editor.toggleBlock(format);
      }}>
      <ToolbarIcon isActive={isActive} icon={icon} title={`${title}\n${getHotkeyHint(hotkey)}`} />
    </Button>
  );
};

export default BlockButton;
