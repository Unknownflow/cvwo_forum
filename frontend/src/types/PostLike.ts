type PostLike = {
    id: number;
    postID: number;
    likeType: number;
};

export type PostLikeRequest = Omit<PostLike, "id">;

export default PostLike;
