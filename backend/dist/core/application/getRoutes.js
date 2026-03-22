"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRoutes = void 0;
class GetRoutes {
    routeRepository;
    constructor(routeRepository) {
        this.routeRepository = routeRepository;
    }
    execute(filters) {
        return this.routeRepository.getAll(filters);
    }
}
exports.GetRoutes = GetRoutes;
