export class ProductService {
    private apiUrl = 'http://localhost:8080/api/products';

    constructor(private http: HttpClient) {}

    fetchProducts() {
        return this.http.get<Product[]>(this.apiUrl);
    }

    updateProduct(product: Product) {
        return this.http.put(`${this.apiUrl}/${product.id}`, product);
    }

    deleteProduct(productId: string) {
        return this.http.delete(`${this.apiUrl}/${productId}`);
    }

    markAsSold(productId: string) {
        return this.http.patch(`${this.apiUrl}/${productId}/sold`, {});
    }
}