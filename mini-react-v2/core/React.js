const TEXT_TYPE = "TEXT_ELEMENT";
const EFFECT_TAG_UPDATE = "update";
const EFFECT_TAG_PLACEMENT = "placement";
let nextWorkUnit = null;
let root = null;
let currentRoot = null;
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
    root = nextWorkUnit;
}

function update() {
    console.log(currentRoot)
    nextWorkUnit = {
        dom: currentRoot.dom,
        props: currentRoot.props,
        alternate: currentRoot,
    };
    console.log(nextWorkUnit);
    // 保留一个根节点用来统一提交
    root = nextWorkUnit;
}
function workloop(deadline) {
    let shouleYield = false;
    while (!shouleYield && nextWorkUnit) {
        nextWorkUnit = performWorkUnit(nextWorkUnit);
        shouleYield = deadline.timeRemaining() < 1;
    }
    // 构建结束且有渲染的内容
    if (!nextWorkUnit && root) {
        commitRoot(root.child);
    }
    requestIdleCallback(workloop);
}
function commitRoot(fiber) {
    commitFiber(fiber);
    currentRoot = root;
    root = null;
}
function commitFiber(fiber) {
    if (!fiber) return;
    const parentDom = findParentDom(fiber.parent);

    if (fiber.effectType === EFFECT_TAG_UPDATE) {
        updateProps(fiber, fiber.alternate.props);
    } else if (fiber.effectType === EFFECT_TAG_PLACEMENT) {
        if (fiber.dom) {
            parentDom.append(fiber.dom);
        }
    }
    commitFiber(fiber.child);
    commitFiber(fiber.sibling);
}
function findParentDom(parentFiber) {
    if (!parentFiber) {
        return null;
    }
    if (parentFiber.dom) return parentFiber.dom;
    return findParentDom(parentFiber.parent);
}
function createDom(fiber) {
    return fiber.type === TEXT_TYPE
        ? document.createTextNode("")
        : document.createElement(fiber.type);
}
function updateProps(fiber, oldProps) {
    if (!fiber.props && oldProps) return;
    // Object.keys(fiber?.props).forEach((propsKey) => {
    //     if (propsKey !== "children") {
    //         fiber.dom[propsKey] = fiber.props[propsKey];
    //     }
    //     if (propsKey.substring(0, 2) === "on") {
    //         //挂载上方法
    //         fiber.dom.addEventListener(propsKey.substring(2).toLocaleLowerCase(), fiber?.props[propsKey])
    //     }
    // })
    const newProps = fiber.props;
    if (newProps) {
        // 删除props
        Object.keys(oldProps).forEach((key) => {
            if (key !== "children") {
                if (!(key in newProps)) {
                    dom.removeAttribute(key);
                }
            }
        })
        // 新增props and 更新props
        Object.keys(newProps).forEach((key) => {
            if (key !== "children") {
                if (newProps[key] !== oldProps[key]) {
                    if (key.substring(0, 2) === "on") {
                        //挂载上方法
                        fiber.dom.removeEventListener(key.substring(2).toLocaleLowerCase(), oldProps[key]);
                        fiber.dom.addEventListener(key.substring(2).toLocaleLowerCase(), newProps[key])
                    } else {
                        fiber.dom[key] = newProps[key];
                    }
                }
            }
        })
    }
}
function generateChildren(fiber, childern) {
    const children = childern || fiber.props?.children || [];
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
            newFeber = {
                type: child.type,
                props: child.props,
                child: null,
                parent: fiber,
                sibling: null,
                dom: null,
                effectType: EFFECT_TAG_PLACEMENT,
                alternate: oldFiber,
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
    })
}
function performWorkUnit(fiber) {
    // 是function 说明是 JSX 解析来的
    const fiberTypeIsFunction = typeof fiber.type === "function";
    if (!fiberTypeIsFunction) {
        if (!fiber?.dom) {//存在dom 说明是render传来的初始树
            fiber.dom = createDom(fiber);
            updateProps(fiber, fiber.alternate?.props||{});
        }
    }
    const childern = fiberTypeIsFunction ? [fiber.type(fiber.props)] : fiber.props?.childern;
    generateChildren(fiber, childern);
    if (fiber.child) {
        return fiber.child;
    }
    if (fiber.sibling) {
        return fiber.sibling;
    }
    return getParentSibling(fiber);
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

export default {
    createElement,
    render,
    update
}