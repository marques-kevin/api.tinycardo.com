import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropHistoryIndex1759832000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_history_next_due_at"`);
    await queryRunner.query(`DROP INDEX "IDX_history_user_id_card_id"`);
    await queryRunner.query(`DROP INDEX "IDX_history_deck_id"`);
    await queryRunner.query(`DROP INDEX "IDX_history_card_id"`);
    await queryRunner.query(`DROP INDEX "IDX_history_user_id"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
