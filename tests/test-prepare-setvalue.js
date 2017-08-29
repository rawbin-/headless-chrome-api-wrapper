const chromeLauncher = require('chrome-launcher');
const chromeRemoteInterface = require('chrome-remote-interface');

const prepareAPI = (config = {}) => {
    const {host = 'localhost', port = 9222, autoSelectChrome = true, headless = true} = config;
    const wrapperEntry = chromeLauncher.launch({
        host,
        port,
        autoSelectChrome,
        additionalFlags: [
            '--disable-gpu',
            headless ? '--headless' : ''
        ]
    }).then(chromeInstance => {
        const remoteInterface = chromeRemoteInterface(config).then(chromeAPI => chromeAPI).catch(err => {
            throw err;
        });
        return Promise.all([chromeInstance, remoteInterface])
    }).catch(err => {
        throw err
    });

    return wrapperEntry
};

prepareAPI({
    headless: false
}).then(([chromeInstance, remoteInterface]) => {
    const {Runtime, DOM, Page, Network} = remoteInterface;
    Promise.all([Page.enable(), Network.enable(), DOM.enable()]).then(() => {
        Page.loadEventFired(() => {

            DOM.getDocument().then(({root}) => {
                DOM.querySelector({
                    nodeId: root.nodeId,
                    selector: '#kw'
                }).then((inputNode) => {
                    //this works well as expected
                    // Runtime.evaluate({
                    //     expression: 'document.getElementById("kw").value = "headless chrome"',
                    // });

                    //the below code does not work and throws : Error: Can only set value of text nodes
                    // DOM.setNodeValue({
                    //     nodeId: inputNode.nodeId,
                    //     value: 'headless chrome'
                    // });

                    DOM.setAttributeValue({
                        nodeId:inputNode.nodeId,
                        name:'value',
                        value:'headless chrome'
                    });
                }).then(() => {
                    Runtime.evaluate({
                        expression: 'document.getElementById("kw").value',
                    }).then(({result}) => {
                        console.log(result)
                    })
                })

            });
        });
        Page.navigate({
            url: 'http://www.baidu.com'
        });
    })

});