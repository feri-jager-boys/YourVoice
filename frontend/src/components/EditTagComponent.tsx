import React from 'react';
import { Box, IconButton, Text } from '@chakra-ui/react';
import { FaTrash } from 'react-icons/fa';

import { User } from '../interfaces/User';
import { Forum } from "../interfaces/Forum";
import { Tag } from "../interfaces/Tag";

interface TagProps {
  tag: Tag;
  user: User | null;
  forum: Forum | null;
  handleTagDelete: (tag: Tag) => void;
}

const EditTagComponent: React.FC<TagProps> = ({ tag, user, forum, handleTagDelete }) => {
  return (
    <Box key={tag._id} pl={4} borderLeftWidth="1px" w="full">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        width="100%"
      >
        <Box>
          <Text fontSize="sm" mb={0}>{tag.name}</Text>
        </Box>

        <Box>
          {(user?._id === forum?.adminId._id || forum == null) && (
            <IconButton
              size="xs"
              mr={2}
              aria-label={'Delete tag'}
              onClick={() => handleTagDelete(tag)}
            >
              <FaTrash />
            </IconButton>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default EditTagComponent;
