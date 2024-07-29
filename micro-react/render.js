function render(element, container) {
    // 创建dom对象
    const dom = element.type === 'TEXT_ELEMENT' ? document.createTextNode(element)
        : document.createElement(element.type);

    // 赋值属性
    Object.keys(element.props)
        .filter(key => key !== 'children')
        .forEach(key => dom[key] = element.props[key]);

    // 递归，渲染每一个child
    element.props.children.forEach(child => render(child, dom));

    // 添加element到父节点
    container.appendChild(dom);

}

export default render;