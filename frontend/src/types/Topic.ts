type Topic = {
    id: number;
    title: string;
    author: string;
    posts_count: number;
};

export type TopicRequest = Omit<Topic, "id" | "posts_count">;

export default Topic;
