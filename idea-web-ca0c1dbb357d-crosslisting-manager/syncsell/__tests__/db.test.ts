import { initDB, addProduct, updateProduct, deleteProduct, getProducts, connectPlatform, disconnectPlatform, getPlatforms, recordSale, getSales, addMessage, markMessageAsRead, getMessages } from '../lib/db';

describe('Database', () => {
  beforeAll(() => {
    initDB();
  });

  describe('Products', () => {
    it('should add a product', (done) => {
      const product = {
        title: 'Test Product',
        description: 'Test Description',
        price: 10.99,
        imageUri: 'test.jpg',
        inventory: 10,
        createdAt: new Date().toISOString(),
      };

      addProduct(product, (id) => {
        expect(id).toBeDefined();
        done();
      });
    });

    it('should update a product', (done) => {
      const product = {
        id: 1,
        title: 'Updated Product',
        description: 'Updated Description',
        price: 12.99,
        imageUri: 'updated.jpg',
        inventory: 5,
      };

      updateProduct(product, (result) => {
        expect(result.rowsAffected).toBe(1);
        done();
      });
    });

    it('should delete a product', (done) => {
      deleteProduct(1, (result) => {
        expect(result.rowsAffected).toBe(1);
        done();
      });
    });

    it('should get all products', (done) => {
      getProducts((products) => {
        expect(Array.isArray(products)).toBe(true);
        done();
      });
    });
  });

  describe('Platforms', () => {
    it('should connect a platform', (done) => {
      const platform = {
        name: 'TikTok Shop',
        apiKey: 'test-api-key',
        connectedAt: new Date().toISOString(),
      };

      connectPlatform(platform, (id) => {
        expect(id).toBeDefined();
        done();
      });
    });

    it('should disconnect a platform', (done) => {
      disconnectPlatform(1, (result) => {
        expect(result.rowsAffected).toBe(1);
        done();
      });
    });

    it('should get all platforms', (done) => {
      getPlatforms((platforms) => {
        expect(Array.isArray(platforms)).toBe(true);
        done();
      });
    });
  });

  describe('Sales', () => {
    it('should record a sale', (done) => {
      const sale = {
        productId: 1,
        platformId: 1,
        amount: 10.99,
        soldAt: new Date().toISOString(),
      };

      recordSale(sale, (id) => {
        expect(id).toBeDefined();
        done();
      });
    });

    it('should get all sales', (done) => {
      getSales((sales) => {
        expect(Array.isArray(sales)).toBe(true);
        done();
      });
    });
  });

  describe('Messages', () => {
    it('should add a message', (done) => {
      const message = {
        platformId: 1,
        buyerName: 'Test Buyer',
        content: 'Test Message',
        read: false,
        receivedAt: new Date().toISOString(),
      };

      addMessage(message, (id) => {
        expect(id).toBeDefined();
        done();
      });
    });

    it('should mark a message as read', (done) => {
      markMessageAsRead(1, (result) => {
        expect(result.rowsAffected).toBe(1);
        done();
      });
    });

    it('should get all messages', (done) => {
      getMessages((messages) => {
        expect(Array.isArray(messages)).toBe(true);
        done();
      });
    });
  });
});
