export interface Forum {
    _id: string;
    title: string;
    adminId: {
        _id: string;
        username: string;
    };
}
