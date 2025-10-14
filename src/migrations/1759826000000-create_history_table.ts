import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateHistoryTable1759826000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'history',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'deck_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'card_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'repetition_count',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'ease_factor',
            type: 'float',
            isNullable: false,
            default: 2.5,
          },
          {
            name: 'next_due_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'last_reviewed_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Add index on user_id for faster lookups
    await queryRunner.query(
      `CREATE INDEX "IDX_history_user_id" ON "history" ("user_id")`,
    );

    // Add index on card_id for faster lookups
    await queryRunner.query(
      `CREATE INDEX "IDX_history_card_id" ON "history" ("card_id")`,
    );

    // Add index on deck_id for faster lookups
    await queryRunner.query(
      `CREATE INDEX "IDX_history_deck_id" ON "history" ("deck_id")`,
    );

    // Add composite index on user_id and card_id for unique constraint
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_history_user_id_card_id" ON "history" ("user_id", "card_id")`,
    );

    // Add index on next_due_at for finding cards due for review
    await queryRunner.query(
      `CREATE INDEX "IDX_history_next_due_at" ON "history" ("next_due_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_history_next_due_at"`);
    await queryRunner.query(`DROP INDEX "IDX_history_user_id_card_id"`);
    await queryRunner.query(`DROP INDEX "IDX_history_deck_id"`);
    await queryRunner.query(`DROP INDEX "IDX_history_card_id"`);
    await queryRunner.query(`DROP INDEX "IDX_history_user_id"`);
    await queryRunner.dropTable('history');
  }
}
