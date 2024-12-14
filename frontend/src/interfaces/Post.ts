export interface Post {
  _id: string;
  title: string;
  content: string;
  category: string;
  forumId: number;
  userId: {
    _id: string;
    username: string;
  };
}
