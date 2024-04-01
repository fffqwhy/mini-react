const TEXT_TYPE = "TEXT_ELEMENT";
const EFFECT_TAG_UPDATE = "update";
const EFFECT_TAG_PLACEMENT = "placement";
let wipFiber = null;
let nextWorkUnit = null;
let wipRoot = null;
let currentRoot = null;
let deletions = [];
let stateHooks;
let stateHooksIndex;
/**
 * @description 生成含有nodeValue 的数据结构
 * @param  text 文本 
 * @returns 含有nodeValue 的数据结构
 */
function createTextNode(text) {
    return {
        type: TEXT_TYPE,
        props: {
            nodeValue: text,
            children: []
        }
    }
}
/**
 * @description react 的createElement；
 * @param {标签类型} type 
 * @param {标签的属性} props 
 * @param  {...any} childern 
 */
function createElement(type, props, ...children) {
    console.log(children, "cE");
    return {
        type,
        props: {
            ...props,
            children: children.map((child) => {
                console.log(child);
                const istextType = typeof child === "string" || typeof child === "number";
                if (istextType) {
                    return createTextNode(child);
                } else {
                    return child;
                }
            }),
        }
    }
}

/**
 * 渲染函数
 * @param {*} ele 数据结构 
 * @param {*} container root 
 */
function render(ele, container) {
    wipRoot = {
        dom: container,
        props: { children: [ele] }
    };
    // 保留一个根节点用来统一提交
    nextWorkUnit = wipRoot;
}

function workloop(deadline) {
    let shouleYield = false;
    while (!shouleYield && nextWorkUnit) {
        nextWorkUnit = performWorkUnit(nextWorkUnit);
        shouleYield = deadline.timeRemaining() < 1;
    }
    // 构建结束且有渲染的内容
    if (!nextWorkUnit && wipRoot) {
        commitRoot();
    }
    requestIdleCallback(workloop);
}
function commitRoot() {
    deletions.forEach(commitDeletion);
    deletions = [];
    commitFiber(wipRoot.child);
    commitEffect();
    currentRoot = {
        // stateHooks: currentRoot.stateHooks,
        ...wipRoot
    }
    wipRoot = null;
}
function commitFiber(fiber) {
    if (!fiber) return;
    // const parent = findParentDom(fiber.parent);
    let parent = fiber.parent;
    while (!parent.dom) {
        parent = parent.parent;
    }
    if (fiber.effectType === EFFECT_TAG_UPDATE) {
        updateProps(fiber.dom, fiber.props, fiber.alternate?.props);
    } else if (fiber.effectType === EFFECT_TAG_PLACEMENT) {
        if (fiber.dom) {
            parent.dom.append(fiber.dom);
        }
    }
    commitFiber(fiber.child);
    commitFiber(fiber.sibling);
}
function commitEffect() {
    function run(fiber) {
        if (!fiber) return;
        if (!fiber.alternate) {
            fiber?.effectHooks?.forEach((effectHook) => {
                effectHook.cleanup = effectHook.callback();
            })
        } else {
            fiber?.effectHooks?.forEach((effectHook, index) => {
                if (effectHook.deps.length) {

                    const oldEffectHook = fiber.alternate?.effectHooks[index];
                    const needUpdate = oldEffectHook?.deps.some((oldEdp, someIndex) => {
                        return (oldEdp !== effectHook.deps[someIndex])
                    })
                    needUpdate && (effectHook.cleanup = effectHook?.callback());
                }
            })
        }
        run(fiber.child);
        run(fiber.sibling);
    }
    function runCleanup(fiber) {
        if (!fiber) return;
        fiber.alternate?.effectHooks?.forEach((hook) => {
            if (hook.deps.length) {
                hook.cleanup && hook.cleanup();
            }
        })
        runCleanup(fiber.child);
        runCleanup(fiber.sibling);
    }
    runCleanup(wipRoot);
    run(wipRoot);
}
function commitDeletion(deleteFiber) {
    if (deleteFiber.dom) {
        let parent = deleteFiber.parent;
        while (!parent.dom) {
            parent = parent.parent;
        }
        // const effectHooks = deleteFiber.parent?.effectHooks;
        // if (effectHooks) {
        //     effectHooks.forEach((effect) => {
        //         if (effect.deps.length === 0 && effect.cleanup) {
        //             effect.cleanup();
        //         }
        //     })
        // }
        parent.dom.removeChild(deleteFiber.dom);
    } else {
        commitDeletion(deleteFiber.child)
    }

}
function findParentDom(parentFiber) {
    while (!parentFiber.dom) {
        parentFiber = parentFiber.parent;
    }
    return parentFiber;
}
function createDom(fiber) {

    if (fiber.type === undefined || !fiber.type) {
        console.log(fiber.type)
    }
    return fiber.type === TEXT_TYPE
        ? document.createTextNode("")
        : document.createElement(fiber.type);
}
// todo 重构此方法，将一些判断逻辑外置
function updateProps(dom, nextPrps, prevProps) {
    // if (!fiber.props || !oldProps || !fiber.dom) return;
    if (nextPrps) {
        // 删除props
        Object.keys(prevProps).forEach((key) => {
            if (key !== "children") {
                if (!(key in nextPrps)) {
                    dom.removeAttribute(key);
                }
            }
        })
        // 新增props and 更新props
        Object.keys(nextPrps).forEach((key) => {
            if (key !== "children") {
                if (nextPrps[key] !== prevProps[key]) {
                    if (key.substring(0, 2) === "on") {
                        //挂载上方法
                        const eventName = key.substring(2).toLowerCase();
                        if (prevProps[key]) {
                            // 移除旧的事件处理函数
                            dom.removeEventListener(eventName, prevProps[key]);
                        }
                        if (eventName === "change") {
                            // 对于 "onChange" 事件，设置一个新的处理函数，用于更新状态
                            dom.addEventListener(eventName, (e) => {
                                console.log(e);
                                nextPrps[key](e);
                            });
                        } else {
                            dom.addEventListener(eventName, nextPrps[key])
                        }
                    } else {
                        dom[key] = nextPrps[key];
                    }
                }
            }
        })
    }
}
function reconcileChildren(fiber, children) {
    // const children = childern || fiber.props?.children || [];
    let oldFiber = fiber.alternate?.child;//更新的fiber的alternate 将是上一次的dom树。
    let preChild = null;
    children.forEach((child, index) => {
        const isSameType = oldFiber && oldFiber.type === child.type;
        let newFeber;
        if (isSameType) {
            // todo 更新
            newFeber = {
                type: child.type,
                props: child.props,
                child: null,
                parent: fiber,
                sibling: null,
                dom: oldFiber.dom,
                effectType: EFFECT_TAG_UPDATE,
                alternate: oldFiber,
            }
        } else {
            // todo 创建
            if (child) {
                newFeber = {
                    type: child.type,
                    props: child.props,
                    child: null,
                    parent: fiber,
                    sibling: null,
                    dom: null,
                    effectType: EFFECT_TAG_PLACEMENT,
                }
            }
            if (oldFiber) {
                // console.log("delete fiber", oldFiber, fiber);
                deletions.push(oldFiber);
            }
        }
        if (oldFiber) {
            // 为下一次的兄弟节点准备
            oldFiber = oldFiber.sibling;
        }
        // 将dom树结构的原始数据构造成渲染fiber单元
        if (index === 0) {
            fiber.child = newFeber;//如果他有兄弟节点，那么下次循环将会关联上
        } else {
            if (preChild) {
                preChild.sibling = newFeber;
            }
        }
        if (newFeber) {
            preChild = newFeber;
        }
    });
    // 如果旧的dom 比新的dom 长，要判断是否还有
    while (oldFiber) {
        deletions.push(oldFiber);
        oldFiber = oldFiber.sibling;
    }
}
function performWorkUnit(fiber) {
    // 是function 说明是 JSX 解析来的
    const fiberTypeIsFunction = typeof fiber.type === "function";
    if (fiberTypeIsFunction) {
        updateFunctionComponent(fiber);
    } else {
        updateHostComponent(fiber)
    }
    if (fiber.child) {
        return fiber.child;
    }
    let nextFiber = fiber;
    while (nextFiber) {
        if (nextFiber.sibling) return nextFiber.sibling;
        nextFiber = nextFiber.parent;
    }
}
function updateHostComponent(fiber) {
    if (!fiber?.dom) {//存在dom 说明是render传来的初始树
        const dom = (fiber.dom = createDom(fiber));
        updateProps(dom, fiber.props, {});
    }
    const children = fiber.props?.children;
    reconcileChildren(fiber, children);
}
function updateFunctionComponent(fiber) {
    stateHooks = [];
    stateHooksIndex = 0;
    effectHooks = [];
    wipFiber = fiber;
    console.log(fiber, "fiber = wipFiber");
    const children = [fiber.type(fiber.props)]
    reconcileChildren(fiber, children);
}
requestIdleCallback(workloop);
function useState(init) {
    let currentFiber = wipFiber;
    const oldHook = currentFiber.alternate?.stateHooks[stateHooksIndex];
    const stateHook = {
        state: oldHook ? oldHook.state : init,
        queue: oldHook ? oldHook.queue : []
    };
    console.log("***8", init, oldHook, stateHook, currentFiber);
    stateHook.queue.forEach((action) => {
        stateHook.state = action(stateHook.state);
    })
    stateHook.queue = []
    stateHooksIndex++;
    stateHooks.push(stateHook);
    currentFiber.stateHooks = stateHooks;
    function setState(action) {
        const eagerState = typeof action === "function"
            ? action(stateHook.state)
            : action;
        if (eagerState === stateHook.state) { return }
        typeof action === "function"
            ? stateHook.queue.push(action)
            : stateHook.queue.push(() => action);
        console.log(currentFiber);
        wipRoot = {
            ...currentFiber,
            alternate: currentFiber,
        };
        nextWorkUnit = wipRoot;
    }
    return [stateHook.state, setState]
}
let effectHooks;
function useEffect(callback, deps) {
    const effectHook = {
        callback,
        deps,
        cleanup: undefined
    }
    effectHooks.push(effectHook);
    wipFiber.effectHooks = effectHooks;
}
export default {
    createElement,
    render,
    useState,
    useEffect
}