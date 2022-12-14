// Code generated by "callbackgen -type EMV"; DO NOT EDIT.

package indicator

import ()

func (inc *EMV) OnUpdate(cb func(value float64)) {
	inc.UpdateCallbacks = append(inc.UpdateCallbacks, cb)
}

func (inc *EMV) EmitUpdate(value float64) {
	for _, cb := range inc.UpdateCallbacks {
		cb(value)
	}
}
