import React from "react";
import { Box, IconButton, Text } from "@chakra-ui/react";
import { FaReply, FaTrash } from "react-icons/fa";

import { CommentApiResponse } from "./PostDetail";
import { User } from "../interfaces/User";
import CommentListComponent from "./CommentListComponent";

interface CommentProps {
  comment: CommentApiResponse;
  user: User | null;
  handleCommentDelete: (commentId: string) => void;
  openCommentModal: (parentCommentId: string | null) => void;
}

const CommentComponent: React.FC<CommentProps> = ({comment, user, handleCommentDelete, openCommentModal}) => {
  return (
    <Box
      key={comment._id}
      pl={4}
      borderLeftWidth="1px"
      w="full"
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
        <Box>
          <Text fontSize="sm" color="gray.500">
            {comment.userId.username} -{' '}
            {new Date(comment.createdAt).toLocaleString()}
          </Text>
          <Text>{comment.content}</Text>
        </Box>

        <Box>
          {user?._id === comment.userId._id && (
            <IconButton
              size="sm"
              mr={2}
              aria-label={"Delete comment"}
              onClick={() => handleCommentDelete(comment._id)}>
              <FaTrash/>
            </IconButton>
          )}
          <IconButton
            size="sm"
            mr={2}
            aria-label={"Add comment"}
            onClick={() => openCommentModal(comment._id)}>
            <FaReply/>
          </IconButton>
        </Box>
      </Box>

      <Box mt={2}>
      {comment.replies && comment.replies.length > 0 && (
        <CommentListComponent
          comments={comment.replies}
          user={user}
          handleCommentDelete={handleCommentDelete}
          openCommentModal={openCommentModal} />
      )}
      </Box>
    </Box>
    );
};

export default CommentComponent;
