import React from 'react';
import { Box, IconButton, Text, useColorModeValue } from '@chakra-ui/react';
import { FaReply, FaTrash } from 'react-icons/fa';

import { CommentApiResponse, CommentVoteTypes } from './PostDetail';
import { User } from '../interfaces/User';
import CommentListComponent from './CommentListComponent';
import { FaDownLong, FaUpLong } from 'react-icons/fa6';
import { FormatDate } from "../pages/Posts";

interface CommentProps {
  comment: CommentApiResponse;
  user: User | null;
  openAddCommentModal: (parentCommentId: string | null) => void;
  handleCommentDelete: (commentId: string) => void;
  handleCommentUpvote: (commentId: string) => void;
  handleCommentDownvote: (commentId: string) => void;
}

const CommentComponent: React.FC<CommentProps> = ({
  comment,
  user,
  openAddCommentModal,
  handleCommentDelete,
  handleCommentUpvote,
  handleCommentDownvote,
}) => {
  // Theming
  const usernameColor = useColorModeValue('gray.500', 'gray.400');
  const commentTextColor = useColorModeValue('gray.800', 'white');
  const voteTextColor = useColorModeValue('gray.600', 'gray.400');
  const voteUpColor = useColorModeValue('green.500', 'green.300');
  const voteDownColor = useColorModeValue('red.500', 'red.300');

  const getVoteColor = (votes: number) => {
    if (votes === 0) return voteTextColor;
    else if (votes < 0) return voteDownColor;

    return voteUpColor;
  };

  return (
    <Box key={comment._id} pl={4} borderLeftWidth="1px" w="full">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        width="100%"
      >
        <Box>
          <Text fontSize="sm" color={usernameColor}>
            {comment.userId.username} - {FormatDate(comment.createdAt)}
          </Text>
          <Text
              color={commentTextColor}
              dangerouslySetInnerHTML={{ __html: comment.content }}
              // TODO sanitize input
          />
        </Box>

        <Box>
          {user?._id === comment.userId._id && (
            <IconButton
              size="xs"
              mr={2}
              aria-label={'Delete comment'}
              onClick={() => handleCommentDelete(comment._id)}
              colorScheme="red"
            >
              <FaTrash />
            </IconButton>
          )}
          <IconButton
            size="xs"
            mr={2}
            aria-label={'Add comment'}
            onClick={() => openAddCommentModal(comment._id)}
          >
            <FaReply />
          </IconButton>
          <IconButton
            size="xs"
            mr={1}
            ml={1}
            aria-label={'Upvote comment'}
            colorScheme={
              comment.userVote === CommentVoteTypes.UPVOTE ? 'green' : undefined
            }
            onClick={() => handleCommentUpvote(comment._id)}
          >
            <FaUpLong />
          </IconButton>
          <Text
            as="span"
            display="inline-block"
            mr={1}
            ml={1}
            fontSize="sm"
            width={'15px'}
            textAlign={'center'}
            color={getVoteColor(Number(comment.votes))}
          >
            {comment.votes.toString()}
          </Text>
          <IconButton
            size="xs"
            mr={1}
            ml={1}
            aria-label={'Downvote comment'}
            colorScheme={
              comment.userVote === CommentVoteTypes.DOWNVOTE ? 'red' : undefined
            }
            onClick={() => handleCommentDownvote(comment._id)}
          >
            <FaDownLong />
          </IconButton>
        </Box>
      </Box>

      <Box mt={2}>
        {comment.replies && comment.replies.length > 0 && (
          <CommentListComponent
            comments={comment.replies}
            user={user}
            openAddCommentModal={openAddCommentModal}
            handleCommentDelete={handleCommentDelete}
            handleCommentUpvote={handleCommentUpvote}
            handleCommentDownvote={handleCommentDownvote}
          />
        )}
      </Box>
    </Box>
  );
};

export default CommentComponent;
