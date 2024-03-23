// useReactMini.js

export default function useReactMini() {
    return {
      name: 'my-create-element-plugin',
      transform(code, id) {
        // 只处理包含 JSX 的文件
        if (id.endsWith('.jsx')) {
          // 替换默认的 createElement 调用为你自己的方法
          code = code.replace(/React.createElement/g, 'ReactMini.createElement');
        }
        return {
          code
        };
      }
    };
  }
  