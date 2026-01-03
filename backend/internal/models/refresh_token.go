package models

import "time"

type RefreshToken struct {
	ID        int       `db:"id" json:"id"`
	UserID    int       `db:"user_id" json:"userID"`
	Token     string    `db:"token" json:"token"`
	ExpiresAt time.Time `db:"expires_at" json:"expiresAt"`
	CreatedAt time.Time `db:"created_at" json:"createdAt"`
	IsRevoked bool      `db:"is_revoked" json:"isRevoked"`
}
