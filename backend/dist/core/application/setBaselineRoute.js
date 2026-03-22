"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetBaselineRoute = void 0;
class SetBaselineRoute {
    routeRepository;
    constructor(routeRepository) {
        this.routeRepository = routeRepository;
    }
    execute(routeId) {
        return this.routeRepository.setBaseline(routeId);
    }
}
exports.SetBaselineRoute = SetBaselineRoute;
