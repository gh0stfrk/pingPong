const { writeDataToMongo } = require('../utils');
const { getCredentials } = require('../awsHelper');
const { MongoClient } = require('mongodb');

// Mock Definition
jest.mock('../utils', () => ({
  writeDataToMongo: jest.requireActual('../utils').writeDataToMongo,
}));

jest.mock('../awsHelper', () => ({
  getCredentials: jest.fn(),
}))

jest.mock('mongodb', () => {
  const mClient = {
    connect: jest.fn().mockResolvedValue(),
    db: jest.fn().mockReturnThis(),
    collection: jest.fn().mockReturnThis(),
    insertOne: jest.fn().mockResolvedValue({ insertedId: 'mockId' }),
    close: jest.fn().mockResolvedValue(),
  };
  return {
    MongoClient: jest.fn().mockImplementation(() => mClient),
  };
});

// Test Cases
describe('writeDataToMongo', () => {
  let mockData;

  beforeEach(() => {
    jest.clearAllMocks();
    mockData = { ping: 'pong' };
  });

  // Positive Testing
  it('should write data to MongoDB successfully', async () => {
    require('../awsHelper').getCredentials.mockResolvedValue({
      username: 'mockUser',
      password: 'mockPass',
      hostname: 'mock-host.mongodb.net',
      database: 'mockDB',
    });

    await writeDataToMongo(mockData);

    expect(MongoClient).toHaveBeenCalledWith(
      'mongodb+srv://mockUser:mockPass@mock-host.mongodb.net'
    );
    expect(MongoClient().connect).toHaveBeenCalled();
    expect(MongoClient().db).toHaveBeenCalledWith('mockDB');
    expect(MongoClient().collection).toHaveBeenCalledWith('ping_pong_logs');
    expect(MongoClient().insertOne).toHaveBeenCalledWith(mockData);
    expect(MongoClient().close).toHaveBeenCalled();
  });

  // Negative Testing
  it('should log an error if insertOne fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    MongoClient().insertOne.mockRejectedValue(new Error('Insert failed'));

    require('../awsHelper').getCredentials.mockResolvedValue({
      username: 'mockUser',
      password: 'mockPass',
      hostname: 'mock-host.mongodb.net',
      database: 'mockDB',
    });

    await expect(writeDataToMongo(mockData)).rejects.toThrow('Insert failed');

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error writing data to MongoDB:', expect.any(Error)
    );
    expect(MongoClient().close).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

});
