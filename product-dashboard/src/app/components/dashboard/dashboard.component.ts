export class DashboardComponent {
  products: any[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.initializeData();
  }

  initializeData() {
    this.productService.getProducts().subscribe((data) => {
      this.products = data;
    });
  }

  onUpdate(product: any) {
    this.productService.updateProduct(product).subscribe(() => {
      this.initializeData();
    });
  }

  onDelete(productId: string) {
    this.productService.deleteProduct(productId).subscribe(() => {
      this.initializeData();
    });
  }

  onMarkAsSold(productId: string) {
    this.productService.markAsSold(productId).subscribe(() => {
      this.initializeData();
    });
  }
}