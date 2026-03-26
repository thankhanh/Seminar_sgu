"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NarrationsModule = void 0;
const common_1 = require("@nestjs/common");
const narrations_controller_1 = require("./narrations.controller");
const narrations_service_1 = require("./narrations.service");
const translation_service_1 = require("../../common/services/translation.service");
let NarrationsModule = class NarrationsModule {
};
exports.NarrationsModule = NarrationsModule;
exports.NarrationsModule = NarrationsModule = __decorate([
    (0, common_1.Module)({
        controllers: [narrations_controller_1.NarrationsController],
        providers: [narrations_service_1.NarrationsService, translation_service_1.TranslationService],
        exports: [narrations_service_1.NarrationsService],
    })
], NarrationsModule);
//# sourceMappingURL=narrations.module.js.map