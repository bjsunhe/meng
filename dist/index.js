"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var rxjs_1 = require('rxjs');
var AjaxObservable_1 = require('rxjs/observable/dom/AjaxObservable');
var react_1 = require('react');
var shallowEqual_1 = require('./utils/shallowEqual');
var subject = new rxjs_1.Subject();
var StoreConstructor = (function () {
    function StoreConstructor(state, subject, setState) {
        var _this = this;
        this.state = state;
        this.setState = setState;
        this.subscribe = function (success, error, complete) {
            _this["@@subject"].subscribe(function (sub) { return success(sub.state); }, error, complete);
        };
        this["@@subject"] = subject;
    }
    return StoreConstructor;
}());
exports.StoreConstructor = StoreConstructor;
var Store = new StoreConstructor({}, subject, function (state, callback) {
    if (callback === void 0) { callback = function () { }; }
    Object.assign(this.state, state);
    subject.next(state);
    callback();
});
exports.lift = function (initialState) {
    if (initialState === void 0) { initialState = {}; }
    return function (component) {
        var displayName = component.displayName || component.name || Math.random().toString(32).substr(2);
        return (function (_super) {
            __extends(LiftedComponent, _super);
            function LiftedComponent() {
                _super.apply(this, arguments);
                this._isMounted = false;
                this.observers = [];
            }
            LiftedComponent.prototype.componentWillUnmount = function () {
                Store[displayName] = null;
                this._isMounted = false;
                this.haveOwnPropsChanged = false;
                this.hasStoreStateChanged = false;
                this.observers.map(function (observer) {
                    observer.unsubscribe();
                    observer.remove(observer);
                });
            };
            LiftedComponent.prototype.componentWillReceiveProps = function (nextProps) {
                if (!shallowEqual_1.default(nextProps, this.props)) {
                    this.haveOwnPropsChanged = true;
                    for (var _i = 0, _a = LiftedComponent.resource; _i < _a.length; _i++) {
                        var obj = _a[_i];
                        if (obj.source instanceof Function && obj.source.length > 0) {
                            fork.call(this, Store[displayName], nextProps, obj);
                        }
                    }
                }
            };
            LiftedComponent.prototype.componentWillMount = function () {
                var _this = this;
                var currentStore = new StoreConstructor(Object.assign({}, initialState), new rxjs_1.Subject(), function (state, callback) {
                    if (callback === void 0) { callback = function () { }; }
                    this["@@subject"].next({ state: state, callback: callback });
                });
                component.prototype.setState = currentStore.setState.bind(currentStore);
                Store[displayName] = currentStore;
                var observer = currentStore["@@subject"].subscribe(function (sub) {
                    var storeState = Object.assign(currentStore.state, sub.state);
                    _this.hasStoreStateChanged = true;
                    _this.setState(storeState, sub.callback);
                });
                this.observers.push(observer);
                LiftedComponent.resource.map(function (obj) { return fork.call(_this, currentStore, _this.props, obj); });
            };
            LiftedComponent.prototype.componentDidMount = function () {
                this._isMounted = true;
            };
            LiftedComponent.prototype.shouldComponentUpdate = function () {
                return this.haveOwnPropsChanged || this.hasStoreStateChanged;
            };
            LiftedComponent.prototype.render = function () {
                this.haveOwnPropsChanged = false;
                this.hasStoreStateChanged = false;
                var props = Object.assign({ setState: Store[displayName].setState.bind(Store[displayName]) }, Store[displayName].state, this.props);
                return react_1.createElement(component, props);
            };
            LiftedComponent.displayName = "Lifted(" + displayName + ")";
            LiftedComponent.resource = [];
            return LiftedComponent;
        }(react_1.Component));
    };
};
function fork(currentStore, props, _a) {
    var source = _a.source, success = _a.success, _b = _a.fail, fail = _b === void 0 ? function () { } : _b;
    if (source instanceof rxjs_1.Observable) {
        var observer = source.subscribe(function (x) {
            if (x instanceof AjaxObservable_1.AjaxObservable)
                typeof success === "string" ? currentStore.setState((_a = {}, _a[success] = x.response, _a)) : success(currentStore, x.response);
            else
                typeof success === "string" ? currentStore.setState((_b = {}, _b[success] = x, _b)) : success(currentStore, x);
            var _a, _b;
        }, function (y) { return errorHandle(currentStore, fail, y); });
        return this.observers.push(observer);
    }
    if (window["Promise"] && source instanceof Promise)
        return source.then(function (x) { return typeof success === "string" ? currentStore.setState((_a = {}, _a[success] = x, _a)) : success(currentStore, x); var _a; }, function (y) { return errorHandle(currentStore, fail, y); });
    if (source instanceof StoreConstructor) {
        typeof success === "string" ? currentStore.setState((_c = {}, _c[success] = source.state, _c)) : success(currentStore, source.state);
        var observer = source["@@subject"].subscribe(function (x) { return typeof success === "string" ? currentStore.setState((_a = {}, _a[success] = source.state, _a)) : success(currentStore, x); var _a; }, function (y) { return errorHandle(currentStore, fail, y); });
        return this.observers.push(observer);
    }
    if (source instanceof Function) {
        return fork.call(this, currentStore, props, { source: source(props), success: success, fail: fail });
    }
    typeof success === "string" ? currentStore.setState((_d = {}, _d[success] = source, _d)) : success(currentStore, source);
    var _c, _d;
}
var errorHandle = function (currentStore, fail, y) { return typeof fail === "string" ? currentStore.setState((_a = {}, _a[fail] = y, _a)) : fail(currentStore, y); var _a; };
exports.resource = function (source, success, fail) {
    return function (Component) {
        Component.resource.push({ source: source, success: success, fail: fail });
        return Component;
    };
};
exports.getStore = function () { return Store; };
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Store;
//# sourceMappingURL=index.js.map