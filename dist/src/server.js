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
const multer_1 = __importDefault(require("multer"));
const swaggerDoc_1 = __importDefault(require("./utils/swaggerDoc"));
const seedScript_1 = require("../prisma/seedScript");
const service_1 = require("../prisma/service");
const fs_1 = require("fs");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
// Use body-parser middleware to parse application/json and application/x-www-form-urlencoded
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
const upload = (0, multer_1.default)();
// Use upload.any() middleware to handle multipart form data
app.use(upload.any());
app.use((0, cors_1.default)({
    origin: '*',
    methods: 'GET,POST,PUT,DELETE',
    credentials: true
}));
app.use('/', routes_1.default);
app.get('/hello', (req, res) => {
    res.send('Hello to the pakyi lands, you are through, true');
});
// Setup Swagger documentation
(0, swaggerDoc_1.default)(app);
// Server listening
app.listen(secrets_1.PORT, () => {
    console.log(`Server is running on port ${secrets_1.PORT}`);
});
// Check for seeding flag file and seed the database if necessary
const seedFlagFile = '.seeded';
if (!(0, fs_1.existsSync)(seedFlagFile)) {
    (0, seedScript_1.seedScript)();
    (0, service_1.seedPayableServices)();
    (0, fs_1.writeFileSync)(seedFlagFile, '');
}
