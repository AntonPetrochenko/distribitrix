// Скостылено прямо из файла proto

interface Credentials {
    login: string;
    password: string;
}

interface Claim {
    login: string,
    token: string
}

interface Token {
    value: string;
}

interface TokenPair {
    renew: Token;
    auth: Token;
}