"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const secrets_1 = require("./secrets");
const routes_1 = __importDefault(require("./routes"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const body_parser_1 = __importDefault(require("body-parser"));
const swaggerDoc_1 = __importDefault(require("./utils/swaggerDoc"));
const seedScript_1 = require("../prisma/seedScript");
const service_1 = require("../prisma/service");
const fs_1 = require("fs");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: '*',
    methods: 'GET,POST,PUT,DELETE',
    credentials: true
}));
app.use('/', routes_1.default);
app.get('/hello', (req, res) => {
    res.send('Hello to the pakyi lands, you are through, THIS MUST WORK');
});
app.use('/', routes_1.default);
app.get('/hi', (req, res) => {
    res.send('We are serious, okay?');
});
(0, swaggerDoc_1.default)(app);
app.listen(secrets_1.PORT, () => {
    console.log(`Server is running on port ${secrets_1.PORT}`);
});
const seedFlagFile = '.seeded';
if (!(0, fs_1.existsSync)(seedFlagFile)) {
    (0, seedScript_1.seedScript)();
    (0, service_1.seedPayableServices)();
    (0, fs_1.writeFileSync)(seedFlagFile, '');
}
