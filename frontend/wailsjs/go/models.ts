export namespace model {
	
	export class ItemRaw {
	    id: string;
	    name: string;
	    icon: string;
	
	    static createFrom(source: any = {}) {
	        return new ItemRaw(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.icon = source["icon"];
	    }
	}
	export class ResourcePath {
	    RootPath: string;
	    AssetsPath: string;
	    File: string;
	    Icon: string;
	    Locale: string;
	    Png: string;
	
	    static createFrom(source: any = {}) {
	        return new ResourcePath(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.RootPath = source["RootPath"];
	        this.AssetsPath = source["AssetsPath"];
	        this.File = source["File"];
	        this.Icon = source["Icon"];
	        this.Locale = source["Locale"];
	        this.Png = source["Png"];
	    }
	}

}

export namespace service {
	
	export class DIContainer {
	    AppCtx?: any;
	    Addr: string;
	    Env: string;
	    ResourcePath?: model.ResourcePath;
	    Independencies: Record<string, any>;
	
	    static createFrom(source: any = {}) {
	        return new DIContainer(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.AppCtx = source["AppCtx"];
	        this.Addr = source["Addr"];
	        this.Env = source["Env"];
	        this.ResourcePath = this.convertValues(source["ResourcePath"], model.ResourcePath);
	        this.Independencies = source["Independencies"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class FileHandler {
	    DI?: DIContainer;
	
	    static createFrom(source: any = {}) {
	        return new FileHandler(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.DI = this.convertValues(source["DI"], DIContainer);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class HttpServer {
	    DI?: DIContainer;
	    Listener: any;
	    Addr: string;
	
	    static createFrom(source: any = {}) {
	        return new HttpServer(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.DI = this.convertValues(source["DI"], DIContainer);
	        this.Listener = source["Listener"];
	        this.Addr = source["Addr"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

