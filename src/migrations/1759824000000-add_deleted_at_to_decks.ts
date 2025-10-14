import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeletedAtToDecks1759824000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE decks
      ADD COLUMN deleted_at TIMESTAMP NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE decks
      DROP COLUMN deleted_at
    `);
  }
}
