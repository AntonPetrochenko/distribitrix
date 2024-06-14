// Скостылено прямо из файла proto

interface SearchRequest {
    term: string;
}

interface ProductData {
    id: number;
    name: string;
    data: string;
    enabled: boolean;
}

interface ProductSet {
    products: ProductData[];
}
