export class Tag {
    _id: string | undefined;
    name: string;

    constructor(id: string | undefined, name: string) {
        this._id = id;
        this.name = name;
    }
}
