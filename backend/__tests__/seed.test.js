import { beforeEach, describe, expect, it, vi } from 'vitest';
import { seedEmployees } from '../seed/employees.js';
import { ensureDatabase, getClient } from '../db/client.js';

const client = {
  query: vi.fn(),
  release: vi.fn(),
};

vi.mock('../db/client.js', () => ({
  ensureDatabase: vi.fn(),
  getClient: vi.fn(),
}));

describe('seedEmployees', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ensureDatabase.mockResolvedValue();
    getClient.mockResolvedValue(client);
    client.query.mockResolvedValue({ rows: [] });
  });

  it('resets the table before inserting generated employees by default', async () => {
    const result = await seedEmployees(3);

    expect(ensureDatabase).toHaveBeenCalledOnce();
    expect(client.query).toHaveBeenNthCalledWith(1, 'BEGIN');
    expect(client.query).toHaveBeenNthCalledWith(2, 'TRUNCATE TABLE employees RESTART IDENTITY');
    expect(client.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO employees'), expect.any(Array));
    expect(client.query).toHaveBeenLastCalledWith('COMMIT');
    expect(client.release).toHaveBeenCalledOnce();
    expect(result).toMatchObject({ mode: 'reset', seeded: 3 });
  });

  it('appends employees without truncating existing rows', async () => {
    const result = await seedEmployees(2, { mode: 'append' });
    const executedSql = client.query.mock.calls.map(call => call[0]);

    expect(executedSql).not.toContain('TRUNCATE TABLE employees RESTART IDENTITY');
    expect(client.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO employees'), expect.any(Array));
    expect(result).toMatchObject({ mode: 'append', seeded: 2 });
  });

  it('rolls back and releases the database client when an insert fails', async () => {
    client.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockRejectedValueOnce(new Error('insert failed'))
      .mockResolvedValueOnce({ rows: [] });

    await expect(seedEmployees(1)).rejects.toThrow('insert failed');

    expect(client.query).toHaveBeenLastCalledWith('ROLLBACK');
    expect(client.release).toHaveBeenCalledOnce();
  });
});
