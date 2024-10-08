import { PrismaClient } from "@prisma/client"; 
import express from "express"; 
import md5 from 'md5';
import jwt from 'jsonwebtoken'
import { checkRole } from "../middleware/checkRole";
import { authVerify } from "../middleware/auth";

const app = express(); 
const prisma = new PrismaClient();

app.use(express.json()); 
const router = express.Router();

router.post('/create', authVerify, checkRole(["admin"]), async (req: any, res: any) => { 
    try {
        const dataUser = {
            name: req.body.name,
            email: req.body.email,
            password: md5(req.body.password),
            role: req.body.role
        };

        if (!dataUser.name || !dataUser.email || !dataUser.password || !dataUser.role) {
            return res.json({
                status: false,
                message: "Fill all the fields"
            });
        }

        const existingUser = await prisma.user.findFirst({ 
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

        await prisma.user.create({
            data: dataUser 
        });

        return res.json({
            status: true,
            data: dataUser,
            message: "User added successfully" 
        });

    } catch (error) {
        console.error(error); 
        return res.json({
            status: false,
            message: error 
        });
    }
});

router.get('/getAll', authVerify, checkRole(["admin"]), async (req: any, res: any) => {
    const users = prisma.user
    .findMany()
    .then((result) => {
        return res.json({
            status: true,
            data: result,
            message: "all users have been loaded"
        })  
    })
    .catch((error) => {
        return res.json({
            status: false,
            message: error.message
        })
    })
    
})

router.get('/getById/:id',authVerify, checkRole(["admin"]), async(req: any, res: any) => {
    const id = req.params.id
    if(id){
        const userFound = prisma.user
        .findUnique({where: {id_user: Number(id)}})
        .then((result) => {
            return res.json({
                status: true,
                data: result,
                message: "user has been loaded"
            })
        })
        .catch((error) => {
            return res.json({
                status: false,
                message: error.message
            })
        })
    } else {
        return res.json({
            status: false,
            message: "id is not defined"
        })
    }
})

router.get('/search/:keyword',authVerify, checkRole(["admin"]), async(req:any, res:any) => {
    const params = req.params.keyword
    if(params) {
        const userFound = prisma.user
        .findMany({where: {
            OR: [
                { name: { contains: String(params)} },
                { email: { contains: String(params)} },
            ]
        }})
        .then((result) => {
            return res.json({
                status: true,
                data: result,
                message: "success loading users"
            })
        })
        .catch((error) => {
            return res.json({
                status: false,
                message: error.message
            })
        })
    }else {
        return res.json({
            status: false,
            message: "keyword is not defined"
        })
    }
})

router.delete('/delete/:id',authVerify, checkRole(["admin"]), async(req:any, res: any) => {
    const params = req.params.id
    if(params){
        prisma.user
        .delete({where: {id_user: Number(params)}})
        .then((result) => {
            return res.json({
                status: true,
                message: `user with id ${params} has been deleted`
            })
        })
        .catch((error) => {
            return res.json({
                status: false,
                message: error.message
            })
        })
    } else {
        return res.json({
            status: false,
            message: "id is not defined"
        })
    }
})

router.put('/resetpassword/:id', async(req: any, res: any) => {
    const params = req.params.id
    if(params) {
        const userFound = await prisma.user.findUnique({where: {id_user: Number(params)}})
        if(userFound){
            let data = {
                email: req.body.email,
                password: md5(req.body.oldPassword),
                newPassword : req.body.newPassword
            }
            if(data.email !== userFound?.email && data.password !== userFound?.password) {
                return res.json({
                    status: false,
                    message: "email or password is invalid"
                })
            } else {
                const hashedPassword = await md5(data.newPassword);
                const updatedPassword = prisma.user
                .update({
                    where: {id_user: Number(params)},
                    data: {password: hashedPassword}
                })
                .then((result) => {
                    return res.json({
                        status: true,
                        data: result,
                        message: "password has been updated"
                    })
                })
            }
        } else {
            return res.json({
                status: false,
                message: "user not found"
            })
        }
    } else {
        return res.json({
            status: false,
            message: "id is not defined"
        })
    }
})

router.put('/update/:id', authVerify, checkRole(['admin']), async(req: any, res: any) => {
    const id = req.params.id;   
      try {
        const { name, email, role } = req.body;
        const existingUser = await prisma.user.findUnique({ where: { id_user: Number(id) } });
        if (!existingUser) {
            return res.json({
                status: false,
                message: "user not found"
            })
        }
          const updatedUser = prisma.user
          .update({
            where: { id_user: Number(id) },
            data: {
                name: name || undefined,         
                email: email || undefined, 
                role: role || undefined
            },
          })
          .then((result) => {
            return res.json({
                status: true,
                data: result,
                message: "success updating user"
            })
          })
        } catch (error) {
            return res.json({
                status: false,
                message: error
            })
    }
});

router.post('/login', async(req: any, res: any) => {
    try{
        const params ={
            email: req.body.email,
            password: md5(req.body.password)
        }
        const userFound = await prisma.user.findFirst({where: params})
        if(!userFound){
            return res.json({
                status: false,
                message: "you can't log in"
            })
        } else {
            const token = jwt.sign(
                {
                  id_user: userFound.id_user,
                  email: userFound.email,
                  role: userFound.role, 
                },
                "cashier",
                {
                  expiresIn: '1d',
                }
              );
          
            return res.json({
                status: true,
                message: "login successfull",
                token
            })
        }
    } catch (error) {
        return res.json({
            status: false,
            message: error 
        });
    }
})

export default router;