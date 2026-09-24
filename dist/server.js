"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
mongoose_1.default
    .connect(process.env.MONGO_URL, {})
    .then((data) => {
    console.log("Bluetooth device is connected a Successfully");
    const PORT = process.env.PORT ?? 3003;
    app_1.default.listen(PORT, function () {
        console.log(`The server is running successfully on ${PORT}`);
    });
})
    .catch((err) => {
    console.log("Error on connection MongoDb", err);
});
