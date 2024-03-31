const TEXT_TYPE = "TEXT_ELEMENT";
const EFFECT_TAG_UPDATE = "update";
const EFFECT_TAG_PLACEMENT = "placement";
let wipFiber = null;
let nextWorkUnit = null;
let wipRoot = null;
let currentRoot = {};
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
    return {
        type,
        props: {
            ...props,
            children: children.map((child) => {
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
    nextWorkUnit = {
        dom: container,
        props: { children: [ele] }
    };
    // 保留一个根节点用来统一提交
    wipRoot = nextWorkUnit;
}

function workloop(deadline) {
    let shouleYield = false;
    while (!shouleYield && nextWorkUnit) {
        nextWorkUnit = performWorkUnit(nextWorkUnit);
        shouleYield = deadline.timeRemaining() < 1;
    }
    // 构建结束且有渲染的内容
    if (!nextWorkUnit && wipRoot) {
        commitRoot(wipRoot.child);
    }
    requestIdleCallback(workloop);
}
function commitRoot(fiber) {
    deletions.forEach(commitDeletion);
    deletions = [];
    commitFiber(fiber);
    commitEffect();
    currentRoot = {
        stateHook: currentRoot.stateHook,
        ...wipRoot
    }
    wipRoot = null;
}
function commitFiber(fiber) {
    if (!fiber) return;
    const parent = findParentDom(fiber.parent);

    if (fiber.effectType === EFFECT_TAG_UPDATE) {
        updateProps(fiber.dom, fiber.props, fiber.alternate.props);
    } else if (fiber.effectType === EFFECT_TAG_PLACEMENT) {
        if (fiber.dom) {
            parent.dom.append(fiber.dom);
        }
    }
    commitFiber(fiber.child);
    commitFiber(fiber.sibling);
}
function commitEffect(){
    
}
function commitDeletion(deleteFiber) {
    if (deleteFiber.dom) {
        const parent = findParentDom(deleteFiber.parent);
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

    if (fiber.type === undefined ||!fiber.type) {
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
                        dom.removeEventListener(key.substring(2).toLocaleLowerCase(), prevProps[key]);
                        dom.addEventListener(key.substring(2).toLocaleLowerCase(), nextPrps[key])
                    } else {
                        dom[key] = nextPrps[key];
                    }
                }
            }
        })
    }
}
function reconcileChildren(fiber, childern) {
    const children = childern || fiber.props?.children || [];
    let oldFiber = fiber.alternate?.child;//更新的fiber的alternate 将是上一次的dom树。
    let preChild = null;
    children.forEach((child, index) => {
        const isSameType = oldFiber && child && oldFiber.type === child.type;
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
            newFeber = {
                type: child.type,
                props: child.props,
                child: null,
                parent: fiber,
                sibling: null,
                dom: null,
                effectType: EFFECT_TAG_PLACEMENT,
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
            preChild.sibling = newFeber;
        }
        preChild = newFeber;
        // 如果旧的dom 比新的dom 长，要判断是否还有
    })
}
function performWorkUnit(fiber) {
    // 是function 说明是 JSX 解析来的
    const fiberTypeIsFunction = typeof fiber.type === "function";
    if (!fiberTypeIsFunction) {
        if (!fiber?.dom ) {//存在dom 说明是render传来的初始树
            fiber.dom = createDom(fiber);
            updateProps(fiber.dom, fiber.props, fiber.alternate?.props || {});
        }
    }
    if (fiberTypeIsFunction) {
        updateFunctionComponent(fiber);
    } else {
        const childern = fiber.props?.childern;
        reconcileChildren(fiber, childern);
    }
    if (fiber.child) {
        return fiber.child;
    }
    if (fiber.sibling) {
        return fiber.sibling;
    }
    return getParentSibling(fiber);
}
function updateFunctionComponent(fiber) {
    stateHooks = []
    stateHooksIndex = 0;
    wipFiber = fiber;
    console.log(fiber);
    const children = [fiber.type(fiber.props)]
    reconcileChildren(fiber, children);
}
function getParentSibling(fiber) {
    if (fiber.parent?.sibling) {
        return fiber.parent?.sibling;
    }
    else if (fiber.parent) {
        return getParentSibling(fiber.parent);
    }
    return undefined;
}
requestIdleCallback(workloop);
function useState(init) {
    let currentFiber = wipFiber;
    const oldHook = currentFiber?.alternate?.stateHooks[stateHooksIndex];
    const stateHook = {
        state: oldHook ? oldHook.state : init,
        queue: oldHook ? oldHook.queue : []
    };
    stateHook.queue.forEach((action) => {
        stateHook.state = action(stateHook.state);
    })
    stateHook.queue = []
    stateHooksIndex++;
    stateHooks.push(stateHook);
    currentFiber.stateHooks = stateHooks;
    function setState(action) {
        const eagerState  = typeof action === "function"
        ? action(stateHook.state)
        : action;
        if(eagerState===stateHook.state){return}
        typeof action === "function"
            ? stateHook.queue.push(action)
            : stateHook.queue.push(()=>action);
        console.log(currentFiber);
        wipRoot = {
            ...currentFiber,
            alternate: currentFiber,
        };
        nextWorkUnit = wipRoot;
    }
    return [stateHook.state, setState]
}
function useEffect(){

}
export default {
    createElement,
    render,
    useState
}