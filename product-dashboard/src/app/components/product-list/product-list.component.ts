export class ProductListComponent {
  products: any[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.fetchProducts();
  }

  fetchProducts() {
    this.productService.getProducts().subscribe((data) => {
      this.products = data;
    });
  }

  updateProduct(product: any) {
    this.productService.updateProduct(product).subscribe(() => {
      this.fetchProducts();
    });
  }

  deleteProduct(productId: string) {
    this.productService.deleteProduct(productId).subscribe(() => {
      this.fetchProducts();
    });
  }

  markAsSold(productId: string) {
    this.productService.markAsSold(productId).subscribe(() => {
      this.fetchProducts();
    });
  }
}