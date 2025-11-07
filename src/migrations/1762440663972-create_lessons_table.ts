import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLessonsTable1762440663972 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE lessons (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        deck_id VARCHAR(255) NOT NULL,
        position INTEGER NOT NULL,
        cards TEXT[] NOT NULL DEFAULT '{}',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_lessons_deck_id FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS lessons`);
  }
}
