type SortOrder =
    | "likes_count, desc"
    | "created_at, desc"
    | "created_at, asc"
    | "title, asc"
    | "title, desc"
    | "posts_count, desc";

type SortOptions = {
    label: "Top" | "Newest" | "Oldest" | "Ascending" | "Descending";
    value: SortOrder;
};

export const DEFAULT_SORT_ORDER = "likes_count, desc";
export const DEFAULT_TOPIC_SORT_ORDER = "posts_count, desc";

export const topicsSortOptions: SortOptions[] = [
    { label: "Top", value: "posts_count, desc" },
    { label: "Ascending", value: "title, asc" },
    { label: "Descending", value: "title, desc" },
];

export const postsSortOptions: SortOptions[] = [
    { label: "Top", value: "likes_count, desc" },
    { label: "Newest", value: "created_at, desc" },
    { label: "Oldest", value: "created_at, asc" },
];

export const commentsSortOptions: SortOptions[] = [
    { label: "Top", value: "likes_count, desc" },
    { label: "Newest", value: "created_at, desc" },
    { label: "Oldest", value: "created_at, asc" },
];

export default SortOrder;

export type { SortOptions };
