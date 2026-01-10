type Topic = {
    id: number;
    title: string;
    author: string;
    postsCount: number;
};

export type TopicRequest = Omit<Topic, "id" | "postsCount">;

export default Topic;
