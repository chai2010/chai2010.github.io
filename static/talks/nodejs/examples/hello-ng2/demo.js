"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("core-js/es6/reflect");
require("core-js/es7/reflect");
require("zone.js/dist/zone");
var ngCore = require("@angular/core");
var ngPlatformBrowser = require("@angular/platform-browser");
var ngPlatformBrowserDynamic = require("@angular/platform-browser-dynamic");
var MainComponent = (function () {
    function MainComponent() {
        this.name = '世界';
    }
    return MainComponent;
}());
MainComponent = __decorate([
    ngCore.Component({
        selector: 'my-app',
        template: "\n\t\t<h1>\u4F60\u597D, {{name}}! - V1</h1>\n\t",
        styles: [
            "h1 {\n\t\t\tcolor: #369;\n\t\t\tfont-family: Arial, Helvetica, sans-serif;\n\t\t\tfont-size: 250%;\n\t\t}",
        ],
    })
], MainComponent);
exports.MainComponent = MainComponent;
var MainModule = (function () {
    function MainModule() {
    }
    return MainModule;
}());
MainModule = __decorate([
    ngCore.NgModule({
        imports: [ngPlatformBrowser.BrowserModule],
        declarations: [MainComponent],
        bootstrap: [MainComponent],
    })
], MainModule);
exports.MainModule = MainModule;
function main() {
    ngPlatformBrowserDynamic.platformBrowserDynamic().bootstrapModule(MainModule);
}
exports.main = main;
