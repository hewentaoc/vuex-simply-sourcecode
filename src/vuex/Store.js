import {Vue} from './install'
/**
 * 疑问点，Duyi的方法是怎么把新添加的数据进行监听的
 * －第一节课确实没有监听深层次变化
 * 
 * 疑问点,为啥count的改变会导致num改变
 */
let vm = null;
export default class Store {
    constructor(options){
        let root = {};
        let path = [];
        this._mutations = {};
        this._actions = {};
        this.init(options,root,path)
        vm  = new Vue({
            data:root.state|| {}
        })
        this.state = vm._data;
    }
    /*
      触发mutation函数
    */
    commit = (type,payload)=>{
        if(this._mutations[type]){
            this._mutations[type].forEach((item)=>{
                item(payload);
            })
        }else{
            throw new Error(`${type} is not a function!`)
        }
    }

    dispatch = (type,payload)=>{
        if(this._actions[type]){
            this._actions[type].forEach((item)=>{
                item(payload)
            })
        }else{
            throw new Error(`${type} is not a function`)
        }
    }

    /**
     * 初始化
     * @param {*} options 
     * @param {*} root 
     * @param {*} path 
     */
    init(options,root,path){
      this.dspStore(options,root,path);
    }
    /**
     * 注册mutation函数
     * @param {*} mutations 
     * @param {*} path  记录模块的路径
     * @param {*} namespaced 
     */
    registerMutations(mutations,path,namespaced,context){
        if(typeof mutations != 'object'){
           throw new Error('Error!');
        }
        let store = this;
        let name = this.getNameSpaced(path,namespaced);
        for (const type in mutations) {
            let func = mutations[type];
            if(this._mutations[name + type]){
          　  this._mutations[name + type].push((payload)=>{
                　func.call(store,context.state,payload)
           　 });
            }else{
        　  　 this._mutations[name + type] = [(payload)=>{
                　func.call(store,context.state,payload)
            　 }]; 
            }
        }
    }
    /**
     * 注册actions(异步)函数
     * @param {*} actions 
     * @param {*} path 
     * @param {*} namespaced 
     */
    registerActions(actions,path,namespaced,context){
        if(typeof actions != 'object'){
           throw new Error('Error!');  
        }
        let name = this.getNameSpaced(path,namespaced);
        let store = this;
        for (const type in actions) {
            let func = actions[type];
            if(this._actions[name + type]){
                this._actions[name + type].push((payload)=>{
                   func.call(store,{
                       commit:context.commit,
                       dispatch:context.dispatch
                   },payload)
                })
            }else{
                this._actions[name + type] = [function(payload){
                   func.call(store,{
                        commit:context.commit,
                        dispatch:context.dispatch
                   },payload)
                }]  
            }
        }
    }
    /**
     * 得到此时模块的命名空间
     * @param {*} path 
     * @param {*} namespaced 
     * @returns 
     */
    getNameSpaced(path,namespaced){
        namespaced = !!namespaced;
        let result = path.reduce((prev,item)=>{
            return prev + (namespaced ? item + '/' : '');
        },'')
        return result;
    }
    /**
     * 深度遍历store
     * @param {*} options 
     * @param {*} root 
     * @param {*} path 
     */
    dspStore(options,root,path){
        let {modules = {},state = {},namespaced , mutations , actions} = options;
        if(path.length == 0){
            root.state = {
                ...state
            }
        }else{
            root[path[path.length - 1]] = {
                ...state
            }
        }
        const context = getContext(options,path,namespaced,this);
        this.registerMutations(mutations,path,namespaced,context);//注册mutation函数
        this.registerActions(actions,path,namespaced,context);
        if(typeof modules == 'object'){//遍历modules
            for (const key in modules) {
                path.push(key);
                this.dspStore(modules[key],root.state,path)
            }
        }
    }
}


function getContext(options,path,namespaced,store){
    const curPath = [...path];
    namespaced = !! namespaced;
    const context = {
        commit: namespaced ? (type,payload)=>{
            console.log(771,'commit');
            let name = store.getNameSpaced(path,namespaced);
            store.commit(name + type , payload)
        } : store.commit,
        dispatch: namespaced ? (type,payload)=>{
            console.log(772,'dispatch')
        } : store.dispatch
    }
    Object.defineProperties(context, {
        state: {
          get: () => getNestedState(store,curPath),
          enumerable: true,
        }
      })
    return context;
}

/**
 * 得到模块对应的state
 * @param {*} store 
 * @param {*} path 
 * @returns 
 */
function getNestedState(store,path){
    let root = store.state;
    let state = path.reduce((store,key)=>{
        return store[key];
    },root)
    return state;
}


// state: {}
// _children: {}
// _rawModule: {}
/**
state = {
    name:'hwt',
    test:{

    }
}



 */