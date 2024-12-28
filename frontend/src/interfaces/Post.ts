import { Tag } from "./Tag";

export interface Post {
  _id: string;
  title: string;
  content: string;
  tags: Array<Tag>;
  forumId: {
    _id: string;
    title: string;
  };
  userId: {
    _id: string;
    username: string;
  };
}
