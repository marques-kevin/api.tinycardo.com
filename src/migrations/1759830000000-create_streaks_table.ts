import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStreaksTable1759830000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE streaks (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        date VARCHAR(10) NOT NULL,
        CONSTRAINT unique_user_date UNIQUE (user_id, date),
        CONSTRAINT fk_streaks_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS streaks`);
  }
}
