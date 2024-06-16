// Скостылено прямо из файла proto

interface Credentials {
    login: string;
    password: string;
}

interface Claim {
    login: string,
    token: string
}

interface TokenPair {
    refresh: string;
    auth: string;
}