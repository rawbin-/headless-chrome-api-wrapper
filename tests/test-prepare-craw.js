const wrapper = require('../libs/index');

//有this的地方写成箭头函数要注意，这里会有问题
const buttonClick = function () {
    this.click();
};

const setInputValue = () => {
    var input = document.getElementById('kw');
    input.value = 'Web自动化 headless chrome';
};

const parseSearchResult = () => {
    let resultList = [];
    const linkBlocks = document.querySelectorAll('div.result.c-container');
    for (let block of Array.from(linkBlocks)) {
        let targetObj = block.querySelector('h3');
        resultList.push({
            title: targetObj.textContent,
            link: targetObj.querySelector('a').getAttribute('href')
        });
    }
    return resultList;
};


wrapper.prepareAPI({
    // headless: false  //加上这行代码可以查看浏览器的变化
}).then(([chromeInstance, remoteInterface]) => {
    const {Runtime, DOM, Page, Network} = remoteInterface;
    let framePointer;
    Promise.all([Page.enable(), Network.enable(), DOM.enable(),Page.setAutoAttachToCreatedPages({autoAttach:true})]).then(() => {
        Page.domContentEventFired(() => {
            console.log('Page.domContentEventFired')
            Runtime.evaluate({
                expression:`window.location.href`,
                returnByValue:true
            }).then(result => {
                console.log(result)
            })
        });
        Page.frameNavigated(() => {
            console.log('Page.frameNavigated')
            Runtime.evaluate({
                expression:`window.location.href`,
                returnByValue:true
            }).then(result => {
                console.log(result)
            })
        })
        Page.loadEventFired(() => {
            console.log('Page.loadEventFired')
            Runtime.evaluate({
                expression:`window.location.href`,
                returnByValue:true
            }).then(result => {
                console.log(result)
            })
            DOM.getDocument().then(({root}) => {
                //百度首页表单
                DOM.querySelector({
                    nodeId: root.nodeId,
                    selector: '#form'
                }).then(({nodeId}) => {
                    Promise.all([
                        //找到 搜索框填入值
                        DOM.querySelector({
                            nodeId: nodeId,
                            selector: '#kw'
                        }).then((inputNode) => {

                            Runtime.evaluate({
                                // 两种写法
                                // expression:'document.getElementById("kw").value = "Web自动化 headless chrome"',
                                expression: `(${setInputValue})()`
                            });


                            //这段代码不起作用 日狗
                            // DOM.setNodeValue({
                            //     nodeId:inputNode.nodeId,
                            //     value:'Web自动化 headless chrome'
                            // });

                            //上面的代码需求要这么写
                            // DOM.setAttributeValue({
                            //     nodeId:inputNode.nodeId,
                            //     name:'value',
                            //     value:'headless chrome'
                            // });
                        })
                        //找到 提交按钮setInputValue
                        , DOM.querySelector({
                            nodeId,
                            selector: '#su'
                        })
                    ]).then(([inputNode, buttonNode]) => {

                        Runtime.evaluate({
                            expression: 'document.getElementById("kw").value',
                        }).then(({result}) => {
                            console.log(result)
                        });

                        return DOM.resolveNode({
                            nodeId: buttonNode.nodeId
                        }).then(({object}) => {
                            const {objectId} = object;
                            return Runtime.callFunctionOn({
                                objectId,
                                functionDeclaration: `${buttonClick}`
                            })
                        });
                    }).then(() => {
                        setTimeout(() => {
                            Runtime.evaluate({
                                expression: `(${parseSearchResult})()`,
                                returnByValue: true
                            }).then(({result}) => {
                                console.log(result.value)
                                //百度的URL有加密，需要再请求一次拿到真实URL
                            })
                        },3e3)
                    });
                })

            });
        });
        Page.navigate({
            url: 'http://www.baidu.com'
        }).then((frameObj) => {
            framePointer = frameObj
        });
    })

});