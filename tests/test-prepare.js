const wrapper = require('../libs/index');

wrapper.prepareAPI().then(([chromeInstance, remoteInterface]) => {
    const {Runtime,Page} = remoteInterface;
    Runtime.evaluate({
        expression:'window.performance'
    }).then((resultObj) => {
        wrapper.getRecursiveProperties(remoteInterface,resultObj).then((resultObj) => {
            console.log(resultObj)
        })
    });

    // wrapper.getRecursiveResult(remoteInterface,'window.performance').then((resultObj) => {
    //     console.log(resultObj)
    // })
});