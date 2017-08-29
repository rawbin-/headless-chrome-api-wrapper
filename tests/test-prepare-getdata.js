const wrapper = require('../libs/index');

const performanceParser = (perforceTiming) => {
    let timingGather = {};
    perforceTiming = perforceTiming || {};
    timingGather.redirect = perforceTiming.redirectEnd - perforceTiming.redirectEnd-perforceTiming.redirectStart;
    timingGather.dns = perforceTiming.domainLookupEnd - perforceTiming.domainLookupStart;
    timingGather.tcp = perforceTiming.connectEnd - perforceTiming.connectStart;
    timingGather.request = perforceTiming.responseStart - perforceTiming.requestStart;
    timingGather.response = perforceTiming.responseEnd - perforceTiming.responseStart;
    timingGather.domReady = perforceTiming.domContentLoadedEventStart - perforceTiming.navigationStart;
    timingGather.load = perforceTiming.loadEventStart - perforceTiming.navigationStart;
    return timingGather;
};

const showPerformanceInfo = (performanceInfo) => {
    performanceInfo = performanceInfo || {};
    console.log(`页面重定向耗时:${performanceInfo.redirect}`);
    console.log(`DNS查找耗时:${performanceInfo.dns}`);
    console.log(`TCP连接耗时:${performanceInfo.tcp}`);
    console.log(`请求发送耗时:${performanceInfo.request}`);
    console.log(`响应接收耗时:${performanceInfo.response}`);
    console.log(`DOMReady耗时:${performanceInfo.domReady}`);
    console.log(`页面加载耗时:${performanceInfo.load}`);
};

wrapper.prepareAPI().then(([chromeInstance, remoteInterface]) => {
    const {Runtime,Page} = remoteInterface;

    Page.loadEventFired(() => {
        Runtime.evaluate({
            expression:'window.performance.timing.toJSON()',
            returnByValue:true  //不加这个参数，拿到的是一个对象的meta信息 还需要getProperties
        }).then((resultObj) => {
            let {result,exceptionDetails} = resultObj;
            if(!exceptionDetails){
                showPerformanceInfo(performanceParser(result.value))
            }else{
                throw exceptionDetails;
            }
        });
    });

    Page.enable().then(() => {
        Page.navigate({
            // url:'http://www.baidu.com'
            // url:'http://10.86.51.29:8008/touch-list-a?mtype=all&dep=%E5%8C%97%E4%BA%AC&query=%E4%B8%89%E4%BA%9A&category=%E5%85%A8%E9%83%A8%E5%88%86%E7%B1%BB&originalquery=%E4%B8%89%E4%BA%9A&configDepNew=&ddf=true'
            url:'http://touch.dujia.qunar.com/list?mtype=all&dep=%E5%8C%97%E4%BA%AC&query=%E4%B8%89%E4%BA%9A&category=%E5%85%A8%E9%83%A8%E5%88%86%E7%B1%BB&originalquery=%E4%B8%89%E4%BA%9A&configDepNew=&ddf=true'
        })
    });
});

