import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateArchivedUser1759825000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO users (id, email, language, created_at, updated_at)
      VALUES (
        'archived',
        'archived@tinycardo.com',
        'en',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM users WHERE id = 'archived'
    `);
  }
}
