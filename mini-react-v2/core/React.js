const TEXT_TYPE = "TEXT_ELEMENT";
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
    const dom = ele.type === TEXT_TYPE
        ? document.createTextNode("")
        : document.createElement(ele.type);
    // 将除了children的属性赋给生成的dom
    Object.keys(ele.props).forEach((propsKey) => {
        if (propsKey !== "children") {
            dom[propsKey] = ele.props[propsKey];
        }
    })
    // 如果有子节点，处理子节点
    const children = ele.props.children || [];
    children.forEach((child) => {
        render(child, dom);
    })
    container.append(dom);
}
export default {
    createElement,
    render
}