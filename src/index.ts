import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import userRoutes from './controllers/userController'
import menuRoutes from './controllers/menuController'
import transactionRoutes from './controllers/transactionController'

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(cors())
app.use(express.static(__dirname))


app.use('/user', userRoutes)
app.use('/menu', menuRoutes)
app.use('/transaction', transactionRoutes)
app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});

export default app