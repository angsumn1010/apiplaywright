import {test as base} from '@playwright/test';
import { RequestContext } from './request-context';
import { APILogger } from './logger';

export type TestOptions = {
    api: RequestContext;
    logger: APILogger;
}

export const test=base.extend<TestOptions>({
    api:async({request},use)=>{
        const logger = new APILogger()
        const baseUrl = 'https://conduit-api.bondaracademy.com';
        const requestContext = new RequestContext(request, baseUrl, logger);
        await use(requestContext);
    }
})