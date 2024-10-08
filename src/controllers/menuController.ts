import { jenis, PrismaClient } from "@prisma/client"; 
import express from "express"; 
import upload from "./uploadPicture";
import { checkRole } from "../middleware/checkRole";
import { authVerify } from "../middleware/auth";
import path from "path";
import fs from 'fs';

const app = express(); 
const prisma = new PrismaClient();
app.use(express.json()); 
const router = express.Router();

router.post('/create', authVerify, checkRole(['admin']), async(req: any, res: any) => {
    upload.single('picture')(req, res, async(error) => {
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        try {
            const { menu_name, description, price, type } = req.body;
            const picture = req.file ? req.file.filename : null;
            const newMenu = await prisma.menu
            .create({
                data: { menu_name, description, price: parseFloat(price), picture, type: type.toLowerCase() as jenis },
            });
            return res.json({
                status: true,
                data: newMenu,
                message: "new menu has been added"
            })
        } catch(error) {
            return res.json({
                status: false,
                message: error
            })
        }
    })
})

router.get('/getAll', authVerify, checkRole(['admin', 'kasir']), async(req: any, res: any) => {
    const menuFound = await prisma.menu.findMany()
    return res.json({
        status: true,
        data: menuFound,
        message: "all menu have been loaded"
    })
})

router.get('/getById/:id', authVerify, checkRole(['admin', 'kasir']), async(req: any, res: any) => {
    const menuID = req.params.id
    if(menuID){
        try{
            const menuFound = prisma.menu
            .findUnique({where: {id_menu: Number(menuID)}})
            .then((result) => {
                return res.json({
                    status: true,
                    data: result
                })
            })
        } catch(error) {
            return res.json({
                status: false,
                message: error 
            })
        }
    } else{
        return res.json({
            status: false,
            message: 'id is not defined'
        })
    }
})

router.get('/search/:keyword', authVerify, checkRole(['admin','kasir']), async(req: any, res: any) => {
    const keyword = req.params.keyword
    if(keyword){
        try {
            const menuFound = prisma.menu
            .findMany({where: {
                OR: [
                    { menu_name: { contains: String(keyword)} },
                    { description: { contains: String(keyword)} },
                ]
            }})
            .then((result) => {
                return res.json({
                    status: true,
                    data: result,
                    message: "all menus have been loaded"
                })
            })
        } catch(error) {
            return res.json({
                status: false,
                message: error
            })
        }
    } else {
        res.json({
            status: false,
            message: "keyword is not defined"
        })
    }
})

router.get('/type/:type', authVerify, checkRole(['admin','kasir']), async(req: any, res: any) => {
    const type = req.params.type
    if(type) {
        try {
            const menuFound = prisma.menu
            .findMany({where: {type: type}})
            .then((result) => {
                return res.json({
                    status: true,
                    data: result,
                    message: "all menus have been loaded"
                })
            })
        } catch(error) {
            return res.json({
                status: false,
                message: error
            })
        }
    } else {
        return res.json({
            status: false,
            message: "menu type is not defined"
        })
    }
})

router.put('/update/:id', authVerify, checkRole(['admin']), async (req: any, res: any) => {
    const id = req.params.id;   
    upload.single('picture')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      try {
        const { menu_name, description, price, type } = req.body;
        let picture = req.file ? req.file.filename : null;
  
        const existingMenu = await prisma.menu.findUnique({ where: { id_menu: Number(id) } });
        if (!existingMenu) {
          return res.status(404).json({ error: 'Menu not found' });
        }
  
        if (picture && existingMenu.picture) {
          const oldPicturePath = path.join(__dirname, '../', 'picture', existingMenu.picture);
          fs.unlink(oldPicturePath, (err) => {
            if (err) {
              console.error('Error deleting old picture:', err);
            }
          });
        }
          const updatedMenu = prisma.menu
          .update({
            where: { id_menu: Number(id) },
            data: {
                menu_name: menu_name || undefined,         
                description: description || undefined, 
                price: price ? parseFloat(price) : undefined,  
                picture: picture || undefined,    
                type: type ? type.toUpperCase() as jenis : undefined,  
          },
          })
          .then((result) => {
            return res.json({
                status: true,
                data: result,
                message: "success updating menu"
            })
          })
        } catch (error) {
            return res.json({
                status: false,
                message: error
            })
        }
    });
})  

router.delete('/delete/:id', authVerify, checkRole(['admin']), async(req: any, res: any) => {
    const params = req.params.id
    if(params){
        const menuFound = await prisma.menu.findUnique({where: {id_menu: Number(params)}})
        if(menuFound) {
            try {
                if(menuFound.picture) {
                    const picturePath = path.join(__dirname, '../', 'picture', menuFound.picture);
                    fs.unlink(picturePath, (err) => {
                        if (err) {
                            return res.json({
                                status: false,
                                message: err
                            })
                        }
                    });
                }
                prisma.menu
                .delete({where: {id_menu: Number(params)}})
                .then((result) => {
                    return res.json({
                        status: true,
                        data: result,
                        message: `menu with id ${params} has been deleted`
                    })  
                })
            } catch(error) {
                return res.json({
                    status: false,
                    message: error
                })
            }
        } else {
            return res.json({
                status: false,
                message: "menu not found"
            })
        }
    } else {
        return res.json({
            status: false,
            message: "id is not defined"
        })
    }
})
  
export default router