import { APIRequestContext, expect } from "@playwright/test";
import { url } from "inspector/promises";
import { APILogger } from "./logger";

export class RequestContext {
    private request: APIRequestContext;
    private logger: APILogger
    private defaultbaseURL: string;
    private baseUrl: string = "";
    private apipath: string = "";
    private queryParams: Record<string, string | number | boolean> = {};
    private apiHeaders: Record<string, string> = {};
    private apiBody: object = {};

    constructor(request: APIRequestContext, apiBaseUrl: string,logger: APILogger) {
        this.request = request;
        this.defaultbaseURL = apiBaseUrl;
        this.logger = logger;
    }

    url(url: string) {
        this.baseUrl = url;
        return this;
    }
    path(path: string) {
        this.apipath = path;
        return this;
    }
    params(params: Record<string, string | number | boolean>) {
        this.queryParams = params;
        return this;
    }
    headers(headers: Record<string, string>) {
        this.apiHeaders = headers;
        return this;
    }
    body(body: object) {
        this.apiBody = body;
        return this;
    }

    async getRequest(statusCode:number){
        const url = this.getUrl();
        this.logger.logRequest('GET', url, this.apiHeaders)
        const response = await this.request.get(url,{
            headers:this.apiHeaders
        })
        const actualStatus = response.status();  
        const responseJSON=await response.json();  
        
        this.logger.logResponse(actualStatus, responseJSON)
        this.statusCodeValidator(actualStatus, statusCode, this.getRequest)        
        return responseJSON;
    }

    async postRequest(statusCode:number){
        const url = this.getUrl();
        this.logger.logRequest('POST', url, this.apiHeaders, this.apiBody)
        const response = await this.request.post(url,{
            headers:this.apiHeaders,
            data:this.apiBody
        })

        const actualStatus = response.status();  
        const responseJSON=await response.json();  
        
        this.logger.logResponse(actualStatus, responseJSON)        
        this.statusCodeValidator(actualStatus, statusCode, this.postRequest)
        return responseJSON;
    }

    async putRequest(statusCode:number){
        const url = this.getUrl();
        this.logger.logRequest('PUT', url, this.apiHeaders, this.apiBody)
        const response = await this.request.put(url,{
            headers:this.apiHeaders,
            data:this.apiBody
        })

        const actualStatus = response.status();  
        const responseJSON=await response.json();  
        
        this.logger.logResponse(actualStatus, responseJSON)
        this.statusCodeValidator(actualStatus, statusCode, this.putRequest)
        return responseJSON;
    }

    async deleteRequest(statusCode:number){
        const url = this.getUrl();
        this.logger.logRequest('DELETE', url, this.apiHeaders)
        const response = await this.request.delete(url,{
            headers:this.apiHeaders
        })
        const actualStatus = response.status();  
          
        
        this.logger.logResponse(actualStatus)
        this.statusCodeValidator(actualStatus, statusCode, this.deleteRequest)
    }

    private getUrl() {
        const url = new URL(`${this.baseUrl || this.defaultbaseURL}${this.apipath}`);
        for (const [key, value] of Object.entries(this.queryParams)) {
            url.searchParams.append(key, value.toString());
        }        
        return url.toString();
    }

    private statusCodeValidator(actualStatus: number, expectStatus: number, callingMethod: Function) {
        if (actualStatus !== expectStatus) {
            const logs = this.logger.getRecentLogs()
            const error = new Error(`Expected status ${expectStatus} but got ${actualStatus}\n\nRecent API Activity: \n${logs}`)
            Error.captureStackTrace(error, callingMethod)
            throw error
        }
    }
    
}