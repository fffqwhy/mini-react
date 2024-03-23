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
const TEXT_TYPE = "TEXT_ELEMENT";
/**
 * @description 生成含有nodeValue 的数据结构
 * @param  text 文本 
 * @returns 含有nodeValue 的数据结构
 */
function createTextNode(text){
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
function createElement(type,props,...childern){
    return {
        type,
        props:{
            ...props,
            childern,
        }
    }
}
const TextEle = createTextNode("app_text");
const App = createElement("div",{id:"app",class:"app"},TextEle)
const dom = document.createElement(App.type);
dom.id = App.props.id;
document.querySelector("#root").append(dom);
const textNode = document.createTextNode("");
textNode.nodeValue = TextEle.props.nodeValue;
dom.append(textNode);
