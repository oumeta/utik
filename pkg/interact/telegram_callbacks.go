// Code generated by "callbackgen -type Telegram"; DO NOT EDIT.

package interact

import ()

func (tm *Telegram) OnAuthorized(cb func(s *TelegramSession)) {
	tm.authorizedCallbacks = append(tm.authorizedCallbacks, cb)
}

func (tm *Telegram) EmitAuthorized(s *TelegramSession) {
	for _, cb := range tm.authorizedCallbacks {
		cb(s)
	}
}
