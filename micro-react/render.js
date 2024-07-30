function createDOM(fiber) {
    // 创建dom对象
    const dom = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode('')
        : document.createElement(fiber.type);

    // 赋值属性
    Object.keys(fiber.props)
        .filter(key => key !== 'children')
        .forEach(key => dom[key] = fiber.props[key]);

    return dom;
}


function render(element, container) {
    // Root fiber
    nextUnitOfWork = {
        dom: container,
        props: {
            children: [element],
        },
        child: null,
    };
}

let nextUnitOfWork = null;

// 调度
function workLoop(deadline) {
    // shouldYield 表示线程繁忙，应该中断渲染
    let shouldYield = false;
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        // shouldYield 检查线程是否繁忙
        shouldYield = deadline.timeRemaining() < 1;
    }
    // 重新请求
    requestIdleCallback(workLoop);
}

// 空闲时渲染
requestIdleCallback(workLoop);


// 执行一个渲染单元任务，并返回新的任务
function performUnitOfWork(fiber) {
    if (!fiber.dom) {
        fiber.dom = createDOM(fiber);
    }

    // 渲染DOM
    if (fiber.parent) {
        fiber.parent.dom.appendChild(fiber.dom);
    }

    // 给children创建fiber
    const elements = fiber.props.children;
    let prevSibling = null;
    for (let i = 0; i < elements.length; i++) {
        const newFiber = {
            type: elements[i].type,
            props: elements[i].props,
            parent: fiber,
            child: null,
            sibling: null,
            dom: null,
        };

        // 第一个child才会被视为child,其他的是算child的sibling
        if (i === 0) {
            fiber.child = newFiber;
        } else {
            prevSibling.sibling = newFiber;
        }
        prevSibling = newFiber;
    }
    // 如果有child就返回child
    if (fiber.child) {
        return fiber.child;
    }

    // 如果没有child就返回兄弟，向上查找
    let nextFiber = fiber;
    while (nextFiber) {
        // 有sibling
        if (nextFiber.sibling) {
            return nextFiber.sibling;
        }
        nextFiber = nextFiber.parent;
    }


}

export default render;