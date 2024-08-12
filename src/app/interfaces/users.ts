interface User {
    _id?: string;
    username: string;
    createdAt: string;
    updatedAt: string | null;
    finishAt: string;
}

interface UserCreated {
    username: string;
    password: string;
}

export { User, UserCreated };
