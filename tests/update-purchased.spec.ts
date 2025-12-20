import { test, expect } from '@playwright/test';
import { ProductPage } from './pages/ProductPage';

test.describe('BoluCompras - Actualizar Estado de Compra', () => {
    let productPage: ProductPage;
    const testProductName = `TestComprado_${Date.now()}`;

    test.beforeEach(async ({ page }) => {
        productPage = new ProductPage(page);
        await productPage.goto();
        await expect(page).toHaveURL('/');
        await expect(page.locator('[data-testid="product-name-input"]')).toBeAttached();
    });

    test('Debe poder marcar un producto como comprado usando cards', async ({ page }) => {
        // 1. Agregar un producto de prueba
        await productPage.addProduct(testProductName, 'General', 1);
        
        // 2. Verificar que el producto existe en la lista
        await productPage.expectProductExists(testProductName);
        
        // 3. Obtener la card del producto y el botón de estado
        const productCard = page.locator(`[data-testid^="product-card-"]`).filter({ hasText: testProductName });
        await expect(productCard).toBeVisible();
        
        // 4. Buscar el botón de estado de compra dentro de la card
        const purchaseButton = productCard.locator('[data-testid^="purchase-status-"]');
        await expect(purchaseButton).toBeVisible();
        
        // 5. Verificar estado inicial (Pendiente)
        await expect(purchaseButton).toContainText('Pendiente');
        
        // 6. Hacer clic para marcar como comprado
        await purchaseButton.click();
        
        // 7. Esperar respuesta del backend
        await page.waitForResponse(response => 
            response.url().includes('/api/products') && 
            response.request().method() === 'PATCH'
        );
        
        // 8. Verificar que cambió a Comprado
        await expect(purchaseButton).toContainText('Comprado');
    });

    test('Debe poder desmarcar un producto comprado', async ({ page }) => {
        const productName = `TestDesmarcar_${Date.now()}`;
        
        // 1. Agregar producto
        await productPage.addProduct(productName, 'General', 1);
        await productPage.expectProductExists(productName);
        
        const productCard = page.locator(`[data-testid^="product-card-"]`).filter({ hasText: productName });
        const purchaseButton = productCard.locator('[data-testid^="purchase-status-"]');
        
        // 2. Marcar como comprado
        await purchaseButton.click();
        await page.waitForResponse(r => r.url().includes('/api/products') && r.request().method() === 'PATCH');
        await expect(purchaseButton).toContainText('Comprado');
        
        // 3. Desmarcar (volver a Pendiente)
        await purchaseButton.click();
        await page.waitForResponse(r => r.url().includes('/api/products') && r.request().method() === 'PATCH');
        await expect(purchaseButton).toContainText('Pendiente');
    });
});