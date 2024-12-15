export interface Post {
  _id: string;
  title: string;
  content: string;
  category: string;
  forumId: {
    _id: string;
    title: string;
  };
  userId: {
    _id: string;
    username: string;
  };
}
