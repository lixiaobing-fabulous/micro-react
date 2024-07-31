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

function commitRoot() {
    deletion.forEach(commitWork);
    commitWork(wipRoot.child);
    currentRoot = wipRoot;
    wipRoot = null;
}

function updateDOM(dom, prevProps, nextProps) {
    const isEvent = (key) => key.startsWith('on');
    // 删除已经没有的props
    Object.keys(prevProps)
        .filter((key) => key !== 'children' && !isEvent(key))
        .filter(key => !key in nextProps)
        .forEach(key => {
            dom[key] = '';
        });
    // 添加新增的属性/修改变化的属性
    Object.keys(nextProps)
        .filter((key) => key !== 'children' && !isEvent(key))
        // 不再prevProps中
        .filter((key) => !key in prevProps || prevProps[key] !== nextProps[key])
        .forEach((key) => {
            dom[key] = nextProps[key];
        });
    // 删除事件处理函数
    Object.keys(prevProps)
        .filter(isEvent)
        // 新的属性没有，或者有变化
        .filter((key) => !key in nextProps || prevProps[key] !== nextProps[key])
        .forEach((key) => {
            const eventType = key.toLowerCase().substring(2);
            dom.removeEventListener(eventType, nextProps[key]);
        });

    // 添加新的事件处理函数
    Object.keys(prevProps)
        .filter(isEvent)
        .filter((key) => prevProps[key] !== nextProps[key])
        .forEach((key) => {
            const eventType = key.toLowerCase().substring(2);
            dom.addEventListener(eventType, nextProps[key]);
        });
}

function commitWork(fiber) {
    if (!fiber) {
        return;
    }
    const domParent = fiber.parent.dom;
    if (fiber.effectTag === 'PLACEMENT' && fiber.dom) {
        domParent.append(fiber.dom);
    } else if (fiber.effectTag === 'DELETION' && fiber.dom) {
        domParent.removeChild(fiber.dom);
    } else if (fiber.effectTag === 'UPDATE') {
        updateDOM(fiber.dom, fiber.alternate.props, fiber.props);
    }
    commitWork(fiber.child);
    commitWork(fiber.sibling);
}


function render(element, container) {
    // Root fiber
    wipRoot = {
        dom: container,
        props: {
            children: [element],
        },
        child: null,
        alternate: currentRoot,
    };
    deletion = []
    nextUnitOfWork = wipRoot;
}

let nextUnitOfWork = null;
let wipRoot = null;
let currentRoot = null;
let deletion = null;

// 调度
function workLoop(deadline) {
    // shouldYield 表示线程繁忙，应该中断渲染
    let shouldYield = false;
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        // shouldYield 检查线程是否繁忙
        shouldYield = deadline.timeRemaining() < 1;
    }
    if (!nextUnitOfWork && wipRoot) {
        commitRoot();
    }
    // 重新请求
    requestIdleCallback(workLoop);
}

// 空闲时渲染
requestIdleCallback(workLoop);


function reconcileChildren(wipFiber, elements) {
    let index = 0;
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
    // 给children创建fiber
    let prevSibling = null;
    while (index < elements.length || oldFiber) {
        const element = elements[index];
        const sameType = oldFiber && element && oldFiber.type === element.type;
        let newFiber = null;
        if (sameType) {
            newFiber = {
                type: oldFiber.type,
                props: element.props,
                dom: oldFiber.dom,
                parent: wipFiber,
                alternate: oldFiber,
                effectTag: 'UPDATE',
            };
        }
        if (element && !sameType) {
            newFiber = {
                type: element.type,
                props: element.props,
                dom: null,
                parent: wipFiber,
                alternate: null,
                effectTag: 'PLACEMENT',
            }
        }
        if (oldFiber && !sameType) {
            oldFiber.effectTag = 'DELETION';
            deletion.push(oldFiber);
        }

        if (oldFiber) {
            oldFiber = oldFiber.sibling;
        }


        // 第一个child才会被视为child,其他的是算child的sibling
        if (index === 0) {
            wipFiber.child = newFiber;
        } else {
            prevSibling.sibling = newFiber;
        }
        prevSibling = newFiber;
        index++;
    }
}

// 执行一个渲染单元任务，并返回新的任务
function performUnitOfWork(fiber) {
    if (!fiber.dom) {
        fiber.dom = createDOM(fiber);
    }
    reconcileChildren(fiber, fiber.props.children);
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