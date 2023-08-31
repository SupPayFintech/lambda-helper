import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import logger from '../logger';

type RequestCallback = (request: AxiosRequestConfig) => AxiosRequestConfig;
type ResponseCallback = (response: AxiosResponse) => AxiosResponse;

const Log = logger();
const alwaysHiddenAttributes = ['Authorization'];

export interface ClientHttpConfig extends AxiosRequestConfig {
  requestCallback?: RequestCallback;
  responseCallback?: ResponseCallback;
  hiddenAttributes?: string[];
}

const HttpClient = (config: ClientHttpConfig = {}): AxiosInstance => {
  const instance = axios.create(config);

  const hideBasicAuthInUrl = (url: string | undefined): string | undefined => {
    if (!url) return url;
    return url.replace(/\/\/(.*):(.*)@/, '//****@');
  };

  const hideSensitiveInfo = (obj: any, hiddenAttributes: string[] = []) => {
    const newObj = { ...obj };
    hiddenAttributes.forEach((attr) => {
      if (newObj[attr]) {
        newObj[attr] = '****';
      }
    });
    return newObj;
  };

  const prepareForLogging = (obj: any) => {
    return {
      url: hideBasicAuthInUrl(obj.url),
      headers: hideSensitiveInfo(obj.headers, [...(config.hiddenAttributes || []), ...alwaysHiddenAttributes]),
      method: obj.method,
      data: obj.data,
      status: obj.status,
    };
  };

  const requestInterceptor = (request: InternalAxiosRequestConfig): any => {
    const modifiedRequest = config.requestCallback ? config.requestCallback(request) : request;
    Log.debug(prepareForLogging(request), 'request');
    return modifiedRequest;
  };

  const requestErrorInterceptor = (error: any): Promise<never> => {
    Log.error(prepareForLogging(error), 'request-error');
    return Promise.reject(error);
  };

  const responseInterceptor = (response: AxiosResponse): AxiosResponse => {
    const modifiedResponse = config.responseCallback ? config.responseCallback(response) : response;
    Log.debug(prepareForLogging(response), 'response');
    return modifiedResponse;
  };

  const responseErrorInterceptor = (error: any): Promise<never> => {
    Log.error(prepareForLogging(error.response), 'response-error');
    return Promise.reject(error);
  };

  instance.interceptors.request.use(requestInterceptor, requestErrorInterceptor);
  instance.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

  return instance;
};

export default HttpClient;
