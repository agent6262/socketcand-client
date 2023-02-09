export class ConnectionObj {
    url: string | undefined;
    id: string | undefined;

    constructor(url: string | undefined, id: string | undefined) {
        this.url = url;
        this.id = id;
    }
}
