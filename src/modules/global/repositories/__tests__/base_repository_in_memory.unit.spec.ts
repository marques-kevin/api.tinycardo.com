import { BaseRepositoryInMemory } from '@/modules/global/repositories/base_repository_in_memory';

interface TestEntity {
  id: string;
  name: string;
  age: number;
  email: string | null;
  tags: string[];
  createdAt: Date;
}

describe('BaseRepository', () => {
  let repository: BaseRepositoryInMemory<TestEntity>;
  let testEntities: TestEntity[];

  beforeEach(() => {
    repository = new BaseRepositoryInMemory<TestEntity>();
    testEntities = [
      {
        id: '1',
        name: 'John Doe',
        age: 30,
        email: 'john@example.com',
        tags: ['developer', 'senior'],
        createdAt: new Date('2023-01-01'),
      },
      {
        id: '2',
        name: 'Jane Smith',
        age: 25,
        email: null,
        tags: ['designer', 'junior'],
        createdAt: new Date('2023-01-02'),
      },
      {
        id: '3',
        name: 'Bob Johnson',
        age: 35,
        email: 'bob@example.com',
        tags: ['developer', 'lead'],
        createdAt: new Date('2023-01-03'),
      },
    ];
  });

  describe('save', () => {
    it('should save an entity and return it', async () => {
      const entity = testEntities[0];
      const result = await repository.save(entity);

      expect(result).toEqual(entity);
      expect(result).toBe(entity); // Same reference
    });

    it('should save multiple entities', async () => {
      for (const entity of testEntities) {
        await repository.save(entity);
      }

      const allEntities = await repository.find_all({});
      expect(allEntities).toHaveLength(3);
    });
  });

  describe('find_by_id', () => {
    beforeEach(async () => {
      for (const entity of testEntities) {
        await repository.save(entity);
      }
    });

    it('should return entity when id exists', async () => {
      const result = await repository.find_by_id('1');
      expect(result).toEqual(testEntities[0]);
    });

    it('should return null when id does not exist', async () => {
      const result = await repository.find_by_id('non-existent-id');
      expect(result).toBeNull();
    });

    it('should return null when searching in empty repository', async () => {
      const emptyRepository = new BaseRepositoryInMemory<TestEntity>();
      const result = await emptyRepository.find_by_id('1');
      expect(result).toBeNull();
    });
  });

  describe('find_all', () => {
    beforeEach(async () => {
      for (const entity of testEntities) {
        await repository.save(entity);
      }
    });

    describe('without parameters', () => {
      it('should return all entities with default ordering by id ASC', async () => {
        const result = await repository.find_all({});
        expect(result).toHaveLength(3);
        expect(result[0].id).toBe('1');
        expect(result[1].id).toBe('2');
        expect(result[2].id).toBe('3');
      });
    });

    describe('where conditions', () => {
      it('should filter by string property', async () => {
        const result = await repository.find_all({
          where: { name: 'John Doe' },
        });
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('1');
      });

      it('should filter by null property', async () => {
        const result = await repository.find_all({
          where: { email: null },
        });
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('2');
      });

      it('should filter by array property (IN condition)', async () => {
        const result = await repository.find_all({
          where: { id: ['1', '3'] },
        });
        expect(result).toHaveLength(2);
        expect(result.map((r) => r.id)).toEqual(['1', '3']);
      });

      it('should filter by multiple conditions (AND)', async () => {
        const result = await repository.find_all({
          where: { name: 'John Doe', id: '1' },
        });
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('1');
      });

      it('should return empty array when no matches', async () => {
        const result = await repository.find_all({
          where: { name: 'Non Existent' },
        });
        expect(result).toHaveLength(0);
      });

      it('should ignore undefined where values', async () => {
        const result = await repository.find_all({
          where: { name: undefined },
        });
        expect(result).toHaveLength(3); // Should return all entities
      });
    });

    describe('ordering', () => {
      it('should order by id ASC by default', async () => {
        const result = await repository.find_all({});
        expect(result.map((r) => r.id)).toEqual(['1', '2', '3']);
      });

      it('should order by age ASC', async () => {
        const result = await repository.find_all({
          order: ['age', 'ASC'],
        });
        expect(result.map((r) => r.age)).toEqual([25, 30, 35]);
      });

      it('should order by age DESC', async () => {
        const result = await repository.find_all({
          order: ['age', 'DESC'],
        });
        expect(result.map((r) => r.age)).toEqual([35, 30, 25]);
      });

      it('should order by id DESC', async () => {
        const result = await repository.find_all({
          order: ['id', 'DESC'],
        });
        expect(result.map((r) => r.id)).toEqual(['3', '2', '1']);
      });
    });

    describe('combined parameters', () => {
      it('should combine where and order (pagination not implemented)', async () => {
        // Clear repository and add the first John Doe entity
        repository.clear();
        await repository.save(testEntities[0]); // John Doe with id: "1"

        // Add more entities with same name
        await repository.save({
          id: '4',
          name: 'John Doe',
          age: 40,
          email: 'john2@example.com',
          tags: ['manager'],
          createdAt: new Date('2023-01-04'),
        });

        const result = await repository.find_all({
          where: { name: 'John Doe' },
          order: ['id', 'DESC'],
          take: 2,
          skip: 0,
        });

        expect(result).toHaveLength(2); // Both John Doe entities
        expect(result[0].id).toBe('4'); // Highest id first
        expect(result[1].id).toBe('1'); // Second John Doe
      });
    });

    describe('edge cases', () => {
      it('should handle empty where object', async () => {
        const result = await repository.find_all({
          where: {},
        });
        expect(result).toHaveLength(3);
      });

      it('should handle empty repository', async () => {
        const emptyRepository = new BaseRepositoryInMemory<TestEntity>();
        const result = await emptyRepository.find_all({});
        expect(result).toHaveLength(0);
      });

      it('should handle take of 0 (pagination not implemented)', async () => {
        const result = await repository.find_all({
          take: 0,
        });
        // With pagination implemented, take: 0 returns empty array
        expect(result).toHaveLength(0);
      });
    });
  });

  describe('sort_data (private method behavior)', () => {
    beforeEach(async () => {
      // Save entities in specific order to test sorting
      await repository.save(testEntities[2]); // age: 35
      await repository.save(testEntities[0]); // age: 30
      await repository.save(testEntities[1]); // age: 25
    });

    it('should sort numeric values correctly in ASC order', async () => {
      const result = await repository.find_all({
        order: ['age', 'ASC'],
      });
      expect(result.map((r) => r.age)).toEqual([25, 30, 35]);
    });

    it('should sort numeric values correctly in DESC order', async () => {
      const result = await repository.find_all({
        order: ['age', 'DESC'],
      });
      expect(result.map((r) => r.age)).toEqual([35, 30, 25]);
    });

    it('should handle string values that can be converted to numbers', async () => {
      const result = await repository.find_all({
        order: ['id', 'ASC'],
      });
      expect(result.map((r) => r.id)).toEqual(['1', '2', '3']);
    });

    it('should sort dates correctly', async () => {
      const dateRepository = new BaseRepositoryInMemory<{
        id: string;
        created_at: Date;
      }>();
      await dateRepository.save({
        id: '1',
        created_at: new Date('2023-01-01'),
      });
      await dateRepository.save({
        id: '2',
        created_at: new Date('2023-03-01'),
      });
      await dateRepository.save({
        id: '3',
        created_at: new Date('2023-02-01'),
      });

      const ascResult = await dateRepository.find_all({
        order: ['created_at', 'ASC'],
      });
      expect(ascResult.map((r) => r.created_at)).toEqual([
        new Date('2023-01-01'),
        new Date('2023-02-01'),
        new Date('2023-03-01'),
      ]);

      const descResult = await dateRepository.find_all({
        order: ['created_at', 'DESC'],
      });
      expect(descResult.map((r) => r.created_at)).toEqual([
        new Date('2023-03-01'),
        new Date('2023-02-01'),
        new Date('2023-01-01'),
      ]);
    });
  });
});
