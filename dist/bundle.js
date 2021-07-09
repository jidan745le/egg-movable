(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.EggMovable = factory());
}(this, (function () { 'use strict';

    class Movable {
        constructor(selector) {
            if (!selector instanceof HTMLElement && typeof selector !== "string") {
                throw TypeError("Constructor params Expected to be typeof String or HTMLElement")
            }
            // debugger;
            this.selectorCollections = selector instanceof HTMLElement ?
                [selector] :
                document.querySelectorAll(selector);
            
            this.dataTransfer = new Map;
        }

        wrapProxyForEvent(e) {
            return new Proxy(e, {
                get: (target, key, receiver) => {
                    if (key === "dataTransfer") {
                        return this.dataTransfer;
                    }
                 
                    return Reflect.get(target, key)
                }
            })
        }



        subscribe(...args) {
            const [mouseDownHandler, moveHandler, mouseUpHandler] = args;
            let onMoveHandler;
            let onMouseupHandler;
            document.addEventListener("mousedown", e => {
                console.log(this.selectorCollections);
                if (Array.prototype.includes.call(this.selectorCollections,e.target)) {
                    //如果命中所需选取的元素
                    const { clientX, clientY } = e;
                    const wrappedEvent = this.wrapProxyForEvent(e);
                    wrappedEvent.dataTransfer.set("dragged", e.target);
                    wrappedEvent.dataTransfer.set("position", { clientX, clientY });

                    mouseDownHandler(wrappedEvent);

                    document.addEventListener("mousemove", (onMoveHandler = e => {
                        moveHandler(e, this.dataTransfer);
                    }));

                    document.addEventListener("mouseup", (onMouseupHandler = e => {
                        const wrappedEvent = this.wrapProxyForEvent(e);
                        mouseUpHandler(wrappedEvent);
                        document.removeEventListener("mousemove", onMoveHandler);
                        document.removeEventListener("mouseup", onMouseupHandler);
                    }));
                }
            });
        }
    }

    return Movable;

})));
