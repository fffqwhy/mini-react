const TEXT_TYPE = "TEXT_ELEMENT";
let nextWorkUnit = null;
let root = null;
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

                const istextType = typeof child==="string"||typeof child==="number"; 
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
    console.log(ele, container);
    nextWorkUnit = {
        dom: container,
        props: { children: [ele] }
    };
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
    root = null;
}
function commitFiber(fiber) {
    if (!fiber) return;
    const parentDom = findParentDom(fiber.parent);
    if(fiber.dom){
        parentDom.append(fiber.dom);
    }
    commitFiber(fiber.child);
    commitFiber(fiber.sibling);
}
function findParentDom(parentFiber){
    if(!parentFiber){
        return null;
    }
    if(parentFiber.dom)return parentFiber.dom;
    return findParentDom(parentFiber.parent);
} 
function createDom(fiber) {
    return fiber.type === TEXT_TYPE
        ? document.createTextNode("")
        : document.createElement(fiber.type);
}
function updateProps(fiber) {
    Object.keys(fiber.props).forEach((propsKey) => {
        if (propsKey !== "children") {
            fiber.dom[propsKey] = fiber.props[propsKey];
        }
    })
}
function generateChildren(fiber,childern) {
    const children = childern || fiber.props.children || [];
    let preChild = null;
    children.forEach((child, index) => {
        const newWork = {
            type: child.type,
            props: child.props,
            child: null,
            parent: fiber,
            sibling: null,
            dom: null,
        }
        // 将dom树结构的原始数据构造成渲染fiber单元
        if (index === 0) {
            fiber.child = newWork;//如果他有兄弟节点，那么下次循环将会关联上
        } else {
            preChild.sibling = newWork;
        }
        preChild = newWork;
    })
}
function performWorkUnit(fiber) {
    console.log(fiber);
    // 是function 说明是 JSX 解析来的
    const fiberTypeIsFunction = typeof fiber.type === "function";
    if(!fiberTypeIsFunction){
        if (!fiber?.dom) {//存在dom 说明是render传来的初始树
            fiber.dom = createDom(fiber);
            updateProps(fiber);
        }
    }
    const childern = fiberTypeIsFunction ? [fiber.type(fiber.props)] : fiber.props.childern;
    generateChildren(fiber,childern);
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
    render
}