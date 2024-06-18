// Скостылено прямо из файла proto

interface Credentials {
    login: string;
    password: string;
}

interface Claim {
    login: string
}

interface TokenPair {
    refresh: string;
    auth: string;
}

interface PermissionResponse {
    isAdmin: boolean;
}

interface AuthenticationResponse {
    isAuthenticated: boolean;
}