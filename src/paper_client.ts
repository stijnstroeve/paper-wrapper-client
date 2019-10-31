import axios from "axios";
import {RequestType} from "./request_type";

interface PaperResponse {
    success: boolean,
    data: any,
    fullResponse?: any
}

export class PaperClient {
    private static instance: PaperClient;

    private baseUrl: string | undefined;
    private fullResponse: boolean = true;

    private getDataByParameters(type: RequestType, parameters?: {name: string, value: any}[]): any {
        const data = {};

        if(parameters) {
            parameters.forEach((parameter) => {
                Object.assign(data, {[parameter.name]: parameter.value});
            });
        }

        return Object.keys(data).length > 0 ? data : undefined;
    }

    setBaseUrl(baseUrl: string): void {
        this.baseUrl = baseUrl;
    }

    includeFullResponse(include: boolean) {
        this.fullResponse = include;
    }

    request(type: RequestType, modules: string[], method: string, parameters?: {name: string, value: any}[]): Promise<PaperResponse> {
        return new Promise<PaperResponse>((resolve, reject) => {
            if(!this.baseUrl) {
                throw new Error("Base url not set!");
            }
            let fullUrl = this.baseUrl;
            let path = "/";
            modules.forEach((module) => {
                path += module + "/";
            });
            path += method;
            fullUrl += path;

            const data = this.getDataByParameters(type, parameters);

            const config = {
                method: type,
                url: fullUrl,
                data: type != RequestType.GET ? data : undefined,
                params: type == RequestType.GET ? data : undefined
            };

            axios(config).then((response) => {
                if(response.data) {
                    const data = response.data;
                    const toResolve = {success: !!data.success, data: data.data ? data.data : {}};
                    if(this.fullResponse) {
                        Object.assign(toResolve, {fullResponse: response});
                    }
                    resolve(toResolve);
                } else {
                    reject(response);
                }
            }).catch((response) => {
                if(response.response && response.response.data) {
                    const data = response.response.data;
                    const toResolve = {success: !!data.success, data: data.data ? data.data : {}};
                    if(this.fullResponse) {
                        Object.assign(toResolve, {fullResponse: response});
                    }
                    resolve(toResolve);
                } else {
                    reject(response);
                }
            });
        });
    }

    static getInstance(): PaperClient {
        if (!this.instance) this.instance = new PaperClient();

        return this.instance;
    }

}