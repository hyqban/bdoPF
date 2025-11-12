package interfaces

import "context"

type ContextProvider interface {
	GetAppCtx() context.Context
}
