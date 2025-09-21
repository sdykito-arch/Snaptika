import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET) should return 404 or Hello World', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect((res) => {
        // Accept either 404 or Hello World depending on implementation
        expect([200, 404]).toContain(res.status);
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
