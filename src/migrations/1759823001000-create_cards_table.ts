import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCardsTable1759823001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE cards (
        id VARCHAR(255) PRIMARY KEY,
        deck_id VARCHAR(255) NOT NULL,
        front VARCHAR(255) NOT NULL,
        back VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_cards_deck_id FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS cards`);
  }
}
