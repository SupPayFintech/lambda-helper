import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import logger from '../logger';

type RequestCallback = (request: AxiosRequestConfig) => AxiosRequestConfig;
type ResponseCallback = (response: AxiosResponse) => AxiosResponse;

const Log = logger();

export interface ClientHttpConfig extends AxiosRequestConfig {
  requestCallback?: RequestCallback;
  responseCallback?: ResponseCallback;
}

const HttpClient = (config: ClientHttpConfig): AxiosInstance => {
  const instance = axios.create(config);

  const requestInterceptor = (request: InternalAxiosRequestConfig): any => {
    const modifiedRequest = config.requestCallback ? config.requestCallback(request) : request;
    Log.debug(modifiedRequest, 'request');
    return modifiedRequest;
  };

  const requestErrorInterceptor = (error: any): Promise<never> => {
    Log.error(error, 'request-error');
    return Promise.reject(error);
  };

  const responseInterceptor = (response: AxiosResponse): AxiosResponse => {
    const modifiedResponse = config.responseCallback ? config.responseCallback(response) : response;
    Log.debug(modifiedResponse, 'response');
    return modifiedResponse;
  };

  const responseErrorInterceptor = (error: any): Promise<never> => {
    Log.error(error, 'response-error');
    return Promise.reject(error);
  };

  instance.interceptors.request.use(requestInterceptor, requestErrorInterceptor);

  instance.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

  return instance;
};

export default HttpClient;
