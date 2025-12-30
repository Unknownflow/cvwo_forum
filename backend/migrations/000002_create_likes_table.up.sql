CREATE TABLE IF NOT EXISTS likes
(
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT,
    comment_id INT,
    like_type INT NOT NULL,
	liked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
	FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE
)