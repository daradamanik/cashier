import request from 'supertest';
import app from '../src/index';
import path from 'path';
import fs from 'fs';

describe('API Tests', () => {
  let adminToken: string;
  let kasirToken: string;

  beforeAll(async () => {
      const adminLoginResponse = await request(app)
          .post('/user/login')
          .send({
              email: 'admin@admin.com',
              password: 'admin123',
          });
      adminToken = adminLoginResponse.body.token;

      const kasirLoginResponse = await request(app)
          .post('/user/login')
          .send({
              email: 'kasir@gmail.com',
              password: 'kasir123',
          });
      kasirToken = kasirLoginResponse.body.token;
  });

    describe('User Routes', () => {
        it('should create a user', async () => {
            const response = await request(app)
              .post('/user/create')
              .set('Authorization', `Bearer ${adminToken}`) 
              .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                role: 'kasir',
              });
            expect(response.status).toBe(200); 
        });

        it('should get a user', async () => {
            const response = await request(app)
              .get('/user/getById/2')
              .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
        });

        it('should get all users', async () => {
            const response = await request(app)
              .get('/user/getAll')
              .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
        });

        it('should get a user based on the name', async () => {
            const response = await request(app)
              .get('/user/search/kasir')
              .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
        });

        it('should edit a user', async () => {
            const response = await request(app)
              .put('/user/update/7')
              .send({
                name: "edit user",
                email: "edituser@gmail.com",
                password: "edit123",
                role: "admin"
              })
              .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
        });

        it('should delete a user', async () => {
            const response = await request(app)
              .delete('/user/delete/7')
              .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
        });

        it('should reset a password', async () => {
            const adminresponse = await request(app)
              .put('/user/resetpassword/7')
              .send({
                email: "daradk@gmail.com",
                oldPassword: "dara123",
                newPassword: "12345"
              })
              .set('Authorization', `Bearer ${adminToken}`);
            expect(adminresponse.status).toBe(200);

            const kasirresponse = await request(app)
              .put('/user/resetpassword/7')
              .send({
                email: "daradk@gmail.com",
                oldPassword: "dara123",
                newPassword: "12345"
              })
              .set('Authorization', `Bearer ${kasirToken}`);
            expect(kasirresponse.status).toBe(200);
        });
    });

    describe('Menu Routes', () => {
        it('should create a menu item', async () => {
          const imagePath = path.join(__dirname, 'test-image.jpeg');
            const response = await request(app)
              .post('/menu/create') 
              .set('Authorization', `Bearer ${adminToken}`)
              .field('menu_name', 'Test Menu')        
              .field('description', 'absolutely delicious') 
              .field('type', 'makanan')                
              .field('price', 10000)                   
              .attach('picture', imagePath); 
            expect(response.status).toBe(200);
        });

        it('should get all menus', async () => {
            const adminresponse = await request(app)
              .get('/menu/getAll')
              .set('Authorization', `Bearer ${adminToken}`);
            expect(adminresponse.status).toBe(200);

            const kasirresponse = await request(app)
              .get('/menu/getAll')
              .set('Authorization', `Bearer ${kasirToken}`);
            expect(kasirresponse.status).toBe(200);
        });

        it('should get a menu', async () => {
            const adminresponse = await request(app)
              .get('/menu/getById/2')
              .set('Authorization', `Bearer ${adminToken}`);
            expect(adminresponse.status).toBe(200);

            const kasirresponse = await request(app)
              .get('/menu/getById/2')
              .set('Authorization', `Bearer ${kasirToken}`);
            expect(kasirresponse.status).toBe(200);
        });

        it('should get menus based on type', async () => {
            const adminresponse = await request(app)
              .get('/menu/type/makanan')
              .set('Authorization', `Bearer ${adminToken}`);
            expect(adminresponse.status).toBe(200);

            const kasirresponse = await request(app)
              .get('/menu/type/makanan')
              .set('Authorization', `Bearer ${kasirToken}`);
            expect(kasirresponse.status).toBe(200);
        });

        it('should update a menu', async () => {
            const response = await request(app)
              .put('/menu/update/1')
              .send({
                menu_name: "roti bakar",
                description: "roti dibakar"
              })
              .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
        });

        it('should delete a menu', async () => {
            const response = await request(app)
              .delete('/menu/delete/6')
              .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
        });
    });

    describe('Transaction Routes', () => {
        it('should create a transaction', async () => {
            const response = await request(app)
              .post('/transaction/create') 
              .set('Authorization', `Bearer ${kasirToken}`)
              .send({
                userID: 3,
                customer: "dara",
                status: "paid",
                details: [
                  { menuID: 1, totalItem: 2, price: 5000 },
                  { menuID: 2, totalItem: 2, price: 3000 }
                ],
              });
            expect(response.status).toBe(200);
        });

        it('should get all transactions', async () => {
            const response = await request(app)
              .get('/transaction/getAll') 
              .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
        });

        it('should get a transaction', async () => {
            const response = await request(app)
              .get('/transaction/getbyId/5') 
              .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
        });

        it('should get a transaction based on cashier id', async () => {
            const response = await request(app)
              .get('/transaction/getIdUser/3') 
              .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
        });

        it('should get a transaction based on transaction date', async () => {
            const response = await request(app)
              .get('/transaction/transactionDate') 
              .set('Authorization', `Bearer ${adminToken}`)
              .send({
                startDate: "2024-10-01",
                endDate: "2024-10-10"
              });
            expect(response.status).toBe(200);
        });

        it('should delete a transaction', async () => {
            const response = await request(app)
              .delete('/transaction/delete/2') 
              .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
        });

        it('should update a transaction', async () => {
            const response = await request(app)
              .put('/transaction/update/6')
              .set('Authorization', `Bearer ${kasirToken}`)
              .send({
                customer: "test customer"
              });
            expect(response.status).toBe(200);
        });

        it('should print a receipt', async () => {
          const response = await request(app)
            .get('/transaction/receipt/5')
            .set('Authorization', `Bearer ${kasirToken}`)
          expect(response.status).toBe(200);
          const receiptPath = path.join(__dirname, 'receipt', `receipt_5.pdf`);
      });
    });
});
