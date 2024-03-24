const TEXT_TYPE = "TEXT_ELEMENT";
let nextWorkUnit = null;
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
                if (typeof child === "string") {
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
        props: {children:[ele]}
    };
}
function workloop(deadline) {
    let shouleYield = false;
    while (!shouleYield && nextWorkUnit) {
        nextWorkUnit = performWorkUnit(nextWorkUnit);
        shouleYield = deadline.timeRemaining() < 1;
    }
    requestIdleCallback(workloop);
}

function createDom(fiber){
    return fiber.type === TEXT_TYPE
    ? document.createTextNode("")
    : document.createElement(fiber.type);
}
function updateProps(fiber){
    Object.keys(fiber.props).forEach((propsKey) => {
        if (propsKey !== "children") {
            fiber.dom[propsKey] = fiber.props[propsKey];
        }
    })
}
function generateChildren(fiber){
    const children = fiber.props.children || [];
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
        if (index === 0) {
            fiber.child = newWork;
        } else {
            preChild.sibling = newWork;
        }
        preChild = newWork;
    })
}
function performWorkUnit(fiber) {
    if (!fiber?.dom) {
        const dom = (fiber.dom = createDom(fiber));
        fiber.parent.dom.append(dom);
        updateProps(fiber);
    }
    generateChildren(fiber);
    if(fiber.child){
        return fiber.child;
    }
    if(fiber.sibling){
        return fiber.sibling;
    }
    return getParentSibling(fiber);
}
function getParentSibling(fiber){
    if(fiber.parent?.sibling){
        return  fiber.parent?.sibling;
    }
    else if(fiber.parent){
        return getParentSibling(fiber.parent);
    }
    return undefined;
}
requestIdleCallback(workloop);

export default {
    createElement,
    render
}