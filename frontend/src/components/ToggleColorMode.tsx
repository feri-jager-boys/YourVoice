import React from 'react';
import { Button, useColorMode } from '@chakra-ui/react';
import { CiLight, CiDark } from 'react-icons/ci';

const ToggleColorMode: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  /* Local Storage: chakra-ui-color-mode */
  return (
    <Button
      position="fixed"
      bottom="16px"
      right="16px"
      zIndex="9999"
      onClick={toggleColorMode}
    >
      {colorMode === 'light' ? <CiLight size={26} /> : <CiDark size={26} />}
    </Button>
  );
};

export default ToggleColorMode;
