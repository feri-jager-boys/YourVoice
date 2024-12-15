import React from "react";
import { VStack } from "@chakra-ui/react";

import CommentComponent from "./CommentComponent";
import { CommentApiResponse } from "./PostDetail";
import { User } from "../interfaces/User";

interface CommentsListProps {
  comments: Array<CommentApiResponse>;
  user: User | null;
  openAddCommentModal: (parentCommentId: string | null) => void;
  handleCommentDelete: (commentId: string) => void;
  handleCommentUpvote: (commentId: string) => void;
  handleCommentDownvote: (commentId: string) => void;
}

const CommentsList: React.FC<CommentsListProps> = (
    {
      comments,
      user,
      openAddCommentModal,
      handleCommentDelete,
      handleCommentUpvote,
      handleCommentDownvote}) => {
  return (
    <VStack spacing={4} align="start">
      {comments
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
          )
        .map((comment) => (
          <CommentComponent
            key={comment._id}
            comment={comment}
            user={user}
            openAddCommentModal={openAddCommentModal}
            handleCommentDelete={handleCommentDelete}
            handleCommentUpvote={handleCommentUpvote}
            handleCommentDownvote={handleCommentDownvote} />
        ))}
    </VStack>
  );
};

export default CommentsList;
