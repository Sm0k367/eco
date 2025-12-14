const request = require('supertest');
const app = require('../server');

describe('Gift Card Endpoints', () => {
  let token;
  let cardId;

  beforeAll(async () => {
    // Login to get token
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'TestPassword123!',
      });
    token = res.body.token;
  });

  describe('POST /api/cards', () => {
    it('should create a new gift card', async () => {
      const res = await request(app)
        .post('/api/cards')
        .set('Authorization', `Bearer ${token}`)
        .send({
          brand: 'Amazon',
          denomination: 100,
          cardCode: 'XXXX-XXXX-XXXX-XXXX',
          expirationDate: '2025-12-31',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.card.brand).toBe('Amazon');
      expect(res.body.card.denomination).toBe(100);
      cardId = res.body.card._id;
    });

    it('should not create card without required fields', async () => {
      const res = await request(app)
        .post('/api/cards')
        .set('Authorization', `Bearer ${token}`)
        .send({
          brand: 'Amazon',
          denomination: 100,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/cards', () => {
    it('should get all user cards', async () => {
      const res = await request(app)
        .get('/api/cards')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.cards)).toBe(true);
    });
  });

  describe('GET /api/cards/:id', () => {
    it('should get a single card', async () => {
      const res = await request(app)
        .get(`/api/cards/${cardId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.card._id).toBe(cardId);
    });

    it('should not get non-existent card', async () => {
      const res = await request(app)
        .get('/api/cards/invalid_id')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/cards/:id', () => {
    it('should update a card', async () => {
      const res = await request(app)
        .put(`/api/cards/${cardId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          notes: 'Updated notes',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.card.notes).toBe('Updated notes');
    });
  });

  describe('DELETE /api/cards/:id', () => {
    it('should delete a card', async () => {
      const res = await request(app)
        .delete(`/api/cards/${cardId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
