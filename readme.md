# 日志
2024年3月27日
支持了函数组件的解析
将渲染进行了统一提交
2024年3月23日

这个版本 使用vite 来解析jsx

reactjs 文件重构,  使用requestIdleCallback API 在浏览器闲时处理dom树。
1、实现分片单元，一个dom节点包含
```json
fiber {
    dom:Element,
    props:fiber[],
    parent:fiber,
    sibling:fiber,
    child:fiber,
    type:Element.type,
}
```
2、每次 被requestIdleCallback调用，都会在将全局的nextFiber传给调度器。调度器会以
$1、child,2、sibling，3、uncle$ d的优先级返回下一个nextFiber。直到为undefined。
