package models

import "time"

type RefreshToken struct {
	ID        int       `db:"id" json:"id"`
	Username  string    `db:"username" json:"username"`
	Token     string    `db:"token" json:"token"`
	ExpiresAt time.Time `db:"expires_at" json:"expires_at"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
	IsRevoked bool      `db:"is_revoked" json:"is_revoked"`
}
