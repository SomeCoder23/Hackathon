"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const CelebImage_js_1 = require("./entities/CelebImage.js");
const TextImage_js_1 = require("./entities/TextImage.js");
const dataSource = new typeorm_1.DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    database: "hackathon_db",
    username: "root",
    password: "",
    entities: [CelebImage_js_1.CelebImage, TextImage_js_1.TextImage],
    synchronize: true,
    logging: false
});
const initialize = () => {
    dataSource.initialize().then(() => {
        console.log("Connected to DB!");
    }).catch(err => {
        console.error("Failed to connect to DB: " + err);
    });
};
exports.default = { dataSource, initialize };
