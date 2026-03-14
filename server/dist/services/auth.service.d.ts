export declare const register: (data: {
    name: string;
    email: string;
    password: string;
    role?: "admin" | "manager" | "staff";
}) => Promise<{
    user: {
        _id: import("mongoose").Types.ObjectId;
        name: string;
        email: string;
        role: "admin" | "manager" | "staff";
        createdAt: Date;
        updatedAt: Date;
    };
    token: string;
}>;
export declare const login: (data: {
    email: string;
    password: string;
}) => Promise<{
    user: {
        _id: import("mongoose").Types.ObjectId;
        name: string;
        email: string;
        role: "admin" | "manager" | "staff";
        createdAt: Date;
        updatedAt: Date;
    };
    token: string;
}>;
export declare const getProfile: (userId: string) => Promise<{
    _id: import("mongoose").Types.ObjectId;
    name: string;
    email: string;
    role: "admin" | "manager" | "staff";
    createdAt: Date;
    updatedAt: Date;
}>;
//# sourceMappingURL=auth.service.d.ts.map