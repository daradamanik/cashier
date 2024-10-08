"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const md5_1 = __importDefault(require("md5"));
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
app.use(express_1.default.json());
const router = express_1.default.Router();
router.post('/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dataUser = {
            name: req.body.name,
            email: req.body.email,
            password: (0, md5_1.default)(req.body.password),
            role: req.body.role
        };
        if (!dataUser.name || !dataUser.email || !dataUser.password || !dataUser.role) {
            return res.json({
                status: false,
                message: "Fill all the fields"
            });
        }
        const existingUser = yield prisma.user.findFirst({
            where: {
                OR: [
                    { name: dataUser.name },
                    { email: dataUser.email }
                ]
            }
        });
        if (existingUser) {
            return res.json({
                status: false,
                message: "User already exists. Choose another name or email"
            });
        }
        yield prisma.user.create({
            data: dataUser
        });
        return res.json({
            status: true,
            message: "User added successfully"
        });
    }
    catch (error) {
        console.error(error);
        return res.json({
            status: false,
            message: error
        });
    }
}));
exports.default = app;
