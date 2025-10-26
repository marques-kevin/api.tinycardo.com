import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDescriptionToDecks1759828000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE decks
      ADD COLUMN description TEXT NOT NULL DEFAULT ''
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE decks
      DROP COLUMN description
    `);
  }
}
