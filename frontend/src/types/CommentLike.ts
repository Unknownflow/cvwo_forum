type CommentLike = {
    id: number;
    commentID: number;
    likeType: number;
};

export type CommentLikeRequest = Omit<CommentLike, "id">;

export default CommentLike;
