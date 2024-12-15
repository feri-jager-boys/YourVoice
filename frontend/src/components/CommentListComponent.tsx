import React from "react";
import { VStack } from "@chakra-ui/react";

import CommentComponent from "./CommentComponent";
import { CommentApiResponse } from "./PostDetail";
import { User } from "../interfaces/User";

interface CommentsListProps {
  comments: Array<CommentApiResponse>;
  user: User | null;
  handleCommentDelete: (commentId: string) => void;
  openCommentModal: (parentCommentId: string | null) => void;
}

const CommentsList: React.FC<CommentsListProps> = ({ comments, user, handleCommentDelete, openCommentModal }) => {
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
            handleCommentDelete={handleCommentDelete}
            openCommentModal={openCommentModal} />
        ))}
    </VStack>
  );
};

export default CommentsList;
