import express from "express"; 
import { checkRole } from "../middleware/checkRole";
import { authVerify } from "../middleware/auth";
import { PrismaClient } from "@prisma/client";
import path from "path";
import puppeteer from "puppeteer";
import fs from 'fs'


const app = express(); 
const prisma = new PrismaClient();
app.use(express.json()); 
const router = express.Router();

router.post('/create', authVerify, checkRole(["kasir"]), async(req: any, res: any) => {
    try{
        const { userID, customer, status, details } = req.body;
        const grandTotal = details.reduce((total: number, item: any) => {
            return total + (Number(item.totalItem) * Number(item.price));
          }, 0);      
        const newTransaction = await prisma.transaction.create({
            data: {
              userID: Number(userID),
              customer,
              status: status.toLowerCase(), 
              transactionDate: new Date(),
              transactionDetail: {
                create: details.map((item: any) => ({
                  menuID: Number(item.menuID),
                  totalItem: Number(item.totalItem),
                  totalPrice: Number(item.totalItem) * Number(item.price), 
                })),
              },
            },
            include: {
              transactionDetail: true, 
            },
        });
        return res.json({
            status: true,
            data: newTransaction, 
            grandTotal: grandTotal,
            message: "new transaction has been added"
        })  
    } catch(error) {
        return res.json({
            status: false,
            message: error
        })
    }
})

router.get('/getAll', authVerify, checkRole(["admin"]), async (req: any, res: any) => {
    const transactions = prisma.transaction
    .findMany()
    .then((result) => {
        return res.json({
            status: true,
            data: result,
            message: "all transactions have been loaded"
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
        const transactionFound = prisma.transaction
        .findUnique({where: {id_transaction: Number(id)}})
        .then((result) => {
            return res.json({
                status: true,
                data: result,
                message: "transaction has been loaded"
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

router.delete('/delete/:id', authVerify, checkRole(["admin"]), async(req: any, res: any) => {
    const param = req.params.id
    if(param){
        try {
            const deletedDetails = await prisma.transactionDetail.deleteMany({
              where: { transactionID: Number(param) },
            });
            if (deletedDetails.count === 0) {
              return res.json({
                success: false,
                message: "Transaction details not found",
              });
            }
            const deletedTransaction = await prisma.transaction.delete({
              where: { id_transaction: Number(param) },
            });       
            return res.json({
              success: true,
              data: deletedTransaction,
              message: "Transaction and its details have been deleted",
            });
          } catch (error) {
            return res.json({
              success: false,
              message: error,
            });
          }
    } else {
        return res.json({
            status: false,
            message: "id is not defined"
        })
    }
})

router.put('/update/:id', authVerify, checkRole(['kasir']), async(req: any, res: any) => {
    const param = req.params.id
    if(param){
        const transactionData = {
            userID: req.body.userID,
            customer: req.body.customer,
            status: req.body.status
        }
        prisma.transaction
        .findUnique({where: {id_transaction: Number(param)}}) 
        .then((result) => {
            if(result) {
                prisma.transaction
                .update({
                    where: {id_transaction: Number(param)},
                    data: {
                        userID: transactionData.userID || undefined,
                        customer: transactionData.customer ||undefined,
                        status: transactionData.status || undefined
                    }
                })
                .then((result) => {
                    return res.json({
                        status: true,
                        data: result,
                        message: "success updating transaction"
                    })
                  })
            } else {
                return res.json({
                    status: false,
                    message: "transaction not found"
                })
            }
        })
    } else {
        return res.json({
            status: false,
            message: "id is not defined"
        })
    }
})

router.get('/getIdUser/:id', authVerify, checkRole(['admin']), async(req: any, res: any) => {
    const { id } = req.params; 
    if (!id ) {
        return res.json({
            success: false,
            message: "Invalid or missing userID",
        });
    }
    try {
        const transactions = await prisma.transaction.findMany({
          where: { userID: Number(id) }, 
          include: {
            transactionDetail: true, 
            id_user: true,           
        },
        });
        if (transactions.length === 0) {
            return res.json({
                success: false,
                message: "No transactions found for this user",
            });
        }
    return res.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error 
    });
  }
})

router.get('/transactionDate', authVerify, checkRole(['admin']), async(req: any, res: any) => {
    const { startDate, endDate } = req.body
    if(!startDate || !endDate){
        return res.json({
            status: false,
            message: "start date or end date must be filled"
        })
    } else {
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const transactionFound = await prisma.transaction
            .findMany({
                where: {
                    transactionDate: {
                        gte: start,
                        lte: end
                    }
                },
                include: {
                    id_user: true,
                    transactionDetail: true
                }
            })
            if(transactionFound.length === 0){
                return res.json({
                    status: false,
                    message: "no transaction found in the given date range"
                })
            }
            return res.json({
                status: true,
                data: transactionFound,
                message: "all transaction have been loaded"
            })
        } catch(error) {
            return res.json({
                status: false,
                message: error
            })
        }
    }
})

router.get('/cashierName', authVerify, checkRole(['admin']), async(req: any, res: any) => {
    const cashier = req.body.cashier
    if(cashier) {
        prisma.user
        .findMany({
            where: {
                name: cashier
            }
        })
        .then((result) => {
            if(result === null) {
                return res.json({
                    status: false,
                    message: "not found"
                })
            } else {
                prisma.transaction
                .findMany({
                    where: {
                        userID: result[0].id_user
                    }
                })
                .then((result) => {
                    if(result === null) {
                        return res.json({
                            status: false,
                            message: "user not found"
                        })
                    } else {
                        return res.json({
                            status: true,
                            data: result
                        })
                    }
                })
                .catch((error) => {
                    return res.json({
                        success: false,
                        message: error.message,
                    });          
                })
            }
        })
        .catch((error) => {
            return res.json({
                success: false,
                message: error.message,
            });          
        })
    } else {
        return res.json({
            status: false,
            message: "please provide cashier name"
        })
    }
})

router.get('/transactionHistory', authVerify, checkRole(['admin']), async(req: any, res: any) => {
    try{
        const transctionFound = await prisma.transaction.findMany({
            include: {
                transactionDetail: true
            }
        })
        return res.json({
            status: true,
            data: transctionFound,
            message: "Order list has been loaded",
          });      
    } catch (error) {
        return res.json({
          status: false,
          message: error
        });
      }    
})

router.get('/receipt/:id', authVerify, checkRole(['kasir']), async(req: any, res: any) => {
    const { id } = req.params;
    try {
        const dataTransaksi = await prisma.transaction.findUnique({
        where: { id_transaction: Number(id) },
        include: {
            id_user: {
              select: { name: true },
            },
            transactionDetail: {
                include: {
                id_menu: {
                  select: { menu_name: true, price: true },
                },
              },
            },
          },
        });
      if (!dataTransaksi) {
        return res.json({
          status: false,
          message: "Transaction not found",
        });
      }

      const transactionDetails = dataTransaksi.transactionDetail || [];
      const receiptItems = transactionDetails.map((detail) => ({
        menuName: detail.id_menu?.menu_name || "Unknown",
        quantity: detail.totalItem,
        pricePerMenu: detail.id_menu?.price,
        totalPerMenu: detail.totalItem * detail.id_menu?.price,
      }));

      const total = receiptItems.reduce((sum, item) => sum + item.totalPerMenu, 0);
      const formattedDate = new Date(dataTransaksi.transactionDate).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });      
      const receipt = {
        cashier: dataTransaksi.id_user.name,
        customer: dataTransaksi.customer,
        date: formattedDate,
        items: receiptItems,
        total,
      };

    const printReceipt = (receipt: any) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 8px 12px; border-bottom: 1px solid #ddd; }
          th { background-color: #f4f4f4; text-align: left;}
          h2 { text-align: center; }
          .store-info { text-align: center; margin-bottom: 20px; }
          .store-info p { margin: 4px 0; }
        </style>
      </head>
      <body>
        <div class="store-info">
          <h2>WOA COFFEE</h2>
          <p>Malang, Indonesia</p>
          <p><strong>Date:</strong> ${receipt.date}</p>
        </div>

        <p><strong>Cashier:</strong> ${receipt.cashier}</p>
        <p><strong>Customer:</strong> ${receipt.customer}</p>
        
        <table>
          <thead>
            <tr>
              <th>Menu</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${
              receipt.items && receipt.items.length > 0 
              ? receipt.items.map((item: any) => `
                <tr>
                  <td>${item.menuName || 'Unknown'}</td>
                  <td>${item.quantity}</td>
                  <td>${item.pricePerMenu}</td>
                  <td>${item.totalPerMenu}</td>
                </tr>
              `).join('') 
              : `<tr><td colspan="4">No items found</td></tr>`
            }
          </tbody>
        </table>
        <h3>Grand Total: ${receipt.total}</h3>
      </body>
      </html>
    `;

    const HTMLreceipt = printReceipt(receipt);
    const directory = path.join(__dirname, '../receipt');
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory);
    }
    const file = path.join(directory, `receipt_${id}.pdf`);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(HTMLreceipt);
    await page.pdf({
      path: file,
      format: 'A4',
      printBackground: true,
    });
    await browser.close();
    res.json({
      message: 'Receipt generated successfully',
      file,
    });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : String(error),
    });
  }
})

export default router