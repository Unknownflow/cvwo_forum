package auth

import (
	"context"

	"github.com/cvwo_assignment/backend/internal/token"
)

type ContextKey string

const UserContextKey ContextKey = "user"

func GetUserFromContext(ctx context.Context) (*token.Claims, bool) {
	claims, ok := ctx.Value(UserContextKey).(*token.Claims)
	return claims, ok
}
