export interface PollOption {
    _id: string;
    text: string;
    votes: number;
}
  
export interface Poll {
    _id: string;
    question: string;
    options: PollOption[];
    userId: string;
    postId?: string;
    votedBy: string[];
    createdAt?: Date;
}
  