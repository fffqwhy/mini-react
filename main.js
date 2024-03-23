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
const TEXT_TYPE = "TEXT_ELEMENT";
const TextEle = {
    type:TEXT_TYPE,
    props:{
        nodeValue:"test-nodeValue",
        children:[]
    }
}
const ele = {
    type:'div',
    props:{
        id:"app",
        children:[TextEle],
    }
};
const dom = document.createElement(ele.type);
dom.id = ele.props.id;
document.querySelector("#root").append(dom);
const textNode = document.createTextNode("");
textNode.nodeValue = TextEle.props.nodeValue;
dom.append(textNode);