export type Question = {
  id: string;
  title: string;
  content: string;
  author: string;
  upvotes: number;
  isAnswered: boolean;
  createdAt: Date;
};
