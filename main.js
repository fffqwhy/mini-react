// const dom = document.createElement("div");

// dom.id = "app";

// document.querySelector("#root").append(dom);

// const textNode = document.createTextNode("");

// textNode.nodeValue = "test text";

// dom.append(textNode);

/**
 * 写死的形式
 * 支持虚拟dom的api,需要那些参数？
 * @param1 type div h1 ..
 * @param2 value 
 * @param3 childern
 */
// const TEXT_TYPE = "TEXT_ELEMENT";
// const TextEle = {
//     type:TEXT_TYPE,
//     props:{
//         nodeValue:"test-nodeValue",
//         children:[]
//     }
// }
// const ele = {
//     type:'div',
//     props:{
//         id:"app",
//         children:[TextEle],
//     }
// };
// const dom = document.createElement(ele.type);
// dom.id = ele.props.id;
// document.querySelector("#root").append(dom);
// const textNode = document.createTextNode("");
// textNode.nodeValue = TextEle.props.nodeValue;
// dom.append(textNode);

/**
 * 数据结构需要支持动态的生成
 */
// const TEXT_TYPE = "TEXT_ELEMENT";
// /**
//  * @description 生成含有nodeValue 的数据结构
//  * @param  text 文本 
//  * @returns 含有nodeValue 的数据结构
//  */
// function createTextNode(text) {
//     return {
//         type: TEXT_TYPE,
//         props: {
//             nodeValue: text,
//             children: []
//         }
//     }
// }
// /**
//  * @description react 的createElement；
//  * @param {标签类型} type 
//  * @param {标签的属性} props 
//  * @param  {...any} childern 
//  */
// function createElement(type, props, ...childern) {
//     return {
//         type,
//         props: {
//             ...props,
//             childern,
//         }
//     }
// }
// const TextEle = createTextNode("app_text");
// const App = createElement("div", { id: "app", class: "app" }, TextEle)
// const dom = document.createElement(App.type);
// dom.id = App.props.id;
// document.querySelector("#root").append(dom);
// const textNode = document.createTextNode("");
// textNode.nodeValue = TextEle.props.nodeValue;
// dom.append(textNode);


/**
 * @part3  开始抽象
 * 数据结构有了，生成数据结构的方法有了，现在要处理生成、渲染了
 * 把大象关冰箱，总共分三步：
 * 1、根据数据结构生成对应标签
 * 2、根据数据结构中的props 赋给标签属性。。。
 * 3、将生成的标签渲染
 */

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
            children:children.map((child)=>{
                if(typeof child==="string"){
                    return createTextNode(child);
                }else{
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
    console.log(ele,container);
    const dom = ele.type === TEXT_TYPE
        ? document.createTextNode("")
        : document.createElement(ele.type);
    // 将除了children的属性赋给生成的dom
    Object.keys(ele.props).forEach((propsKey)=>{
        if(propsKey!=="children"){
            dom[propsKey] = ele.props[propsKey];
        }
    })
    // 如果有子节点，处理子节点
    const children = ele.props.children||[];
    children.forEach((child)=>{
        render(child,dom);
    })
    container.append(dom);
}
const TextEle = createTextNode("render-text");
const TextEle2 = createTextNode("render-text22");
const App = createElement("div", { id: "app", class: "app" }, TextEle,TextEle2,"justString");
render(App,document.getElementById("root"));