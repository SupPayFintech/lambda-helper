import axios from 'axios';
import HttpClient, { ClientHttpConfig } from '../index';

const mockAxiosInstance = {
  get: jest.fn(),
  interceptors: {
    request: {
      handlers: [jest.fn()],
      use: jest.fn(),
    },
    response: {
      handlers: [jest.fn()],
      use: jest.fn(),
    },
  },
};

jest.mock('axios', () => ({
  create: jest.fn(() => mockAxiosInstance),
}));

describe('HttpClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an axios instance', () => {
    HttpClient();
    expect(axios.create).toHaveBeenCalled();
  });

  it('should call requestCallback if provided', () => {
    const requestCallback = jest.fn((req) => req);
    HttpClient({ requestCallback });
    expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
  });

  it('should call responseCallback if provided', () => {
    const responseCallback = jest.fn((res) => res);
    HttpClient({ responseCallback });
    expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
  });

  it('should hide sensitive info in headers', async () => {
    const config: ClientHttpConfig = {
      hiddenAttributes: ['apiKey'],
    };
    const instance = HttpClient(config);
    const request = {
      url: 'http://example.com',
      headers: {
        Authorization: 'Bearer token',
        apiKey: '1234',
      },
    };

    await instance.get(request.url, {
      headers: request.headers,
    });

    expect(mockAxiosInstance.get).toHaveBeenCalledWith('http://example.com', {
      headers: { Authorization: 'Bearer token', apiKey: '1234' },
    });
  });
});
