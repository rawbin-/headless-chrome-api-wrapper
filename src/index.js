
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


const getRecursiveProperties = (remoteInterface,metaInfo,depth = -1) => {
    if(!remoteInterface || !metaInfo){
        return Promise.reject(new Error('invalid params'))
    }


    let metaObj;

    //the returned object by evaluate
    if('result' in metaInfo){
        const {result, exceptionDetails} = metaInfo;
        if(!exceptionDetails){
            metaObj = result;
        }
    }
    // the result property of the returned object by evaluate
    if('objectId' in metaInfo){
        metaObj = metaInfo;
    }

    if(!metaObj){
        const {name,value} = metaInfo;
        return {
            [name]:value && value.value
        }
    }

    const {Runtime} = remoteInterface;
    return Runtime.getProperties(metaObj).then(async (resultObj) => {
        const {result, exceptionDetails} = resultObj;
        if(!exceptionDetails){
            if(Array.isArray(result)){
                let retObj = {};
                for(let propObj of result){
                    let {name,value} = propObj;
                    if(value){
                        retObj[name] = await getRecursiveProperties(remoteInterface,value)
                    }else{
                        retObj[name] = value;
                    }
                }
                return Promise.resolve(retObj);
            }else{
                return getRecursiveProperties(remoteInterface,result,--depth)
            }
        }
    })

};

const getRecursiveResult = (remoteInterface,expression,depth = -1) => {
    if(!remoteInterface || !expression){
        return Promise.reject(new Error('invalid params'))
    }

    const {Runtime} = remoteInterface;
    return Runtime.evaluate({
        expression
    }).then((resultObj) => {
        return getRecursiveProperties(remoteInterface,resultObj);
    });
};



export {
    prepareAPI,
    getRecursiveProperties,
    getRecursiveResult
}

export default {
    prepareAPI,
    getRecursiveProperties,
    getRecursiveResult
}


module.exports = {
    prepareAPI,
    getRecursiveProperties,
    getRecursiveResult
}