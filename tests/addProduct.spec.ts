import { test, expect } from '@playwright/test';
import { ProductPage } from './pages/ProductPage';

test.describe('BoluCompras - Validación Robusta de Productos', () => {
    let productPage: ProductPage;    
    test.beforeEach(async ({ page }) => {
        productPage = new ProductPage(page);
        await productPage.goto();
        
        // Solo validamos que estemos en la página correcta y que el formulario esté presente
        await expect(page).toHaveURL('/');
        // Validamos que el formulario esté listo para usarse
        await expect(page.locator('[data-testid="product-name-input"]')).toBeAttached();
    });

    test('Debe poder agregar un producto y validar todos sus atributos', async ({ page }) => {
        // 1. Setup - Preparar datos del producto
        const timestamp = Date.now();
        const productName = `Test Product ${timestamp}`;
        const category = 'Lácteos';
        const priority = 3;
        const expectedStars = '⭐⭐⭐';

        // 2. Act - Agregar el producto usando el Page Object
        await productPage.addProduct(productName, category, priority);

        // 3. Assert - Validaciones exhaustivas
        // 3.1 Verificar que el producto existe
        await productPage.expectProductExists(productName);
        const card = page.locator('[data-testid^="product-card-"]').filter({ hasText: productName });
        
        // 3.2 Validar el nombre del producto
        await expect(card.locator(`[data-testid^="product-name-"]`)).toHaveText(productName);

        // 3.3 Validar la cantidad inicial
        await expect(card.locator('[data-testid^="quantity-value-"]')).toHaveText('1');

        // 3.4 Validar la prioridad
        await productPage.expectProductPriority(productName, expectedStars);
        const actualPriority = await productPage.getProductPriority(productName);
        expect(actualPriority).toBe(priority);

        // 3.5 Validar que los botones están habilitados
        for (const testid of ['increase-quantity-', 'decrease-quantity-', 'purchase-status-', 'delete-product-']) {
            await expect(card.locator(`[data-testid^="${testid}"]`)).toBeEnabled();
        }

        // Cleanup - eliminar producto de prueba
        await card.locator('[data-testid^="delete-product-"]').click();
        await page.waitForResponse(r => r.url().includes('/api/products') && r.request().method() === 'DELETE');
    });

    test('Debe validar diferentes niveles de prioridad', async ({ page }) => {
        const testCases = [
            { priority: 1, expectedStars: '⭐', category: 'General', description: 'baja' },
            { priority: 3, expectedStars: '⭐⭐⭐', category: 'Lácteos', description: 'media' },
            { priority: 5, expectedStars: '⭐⭐⭐⭐⭐', category: 'Frutas y Verduras', description: 'alta' }
        ];

        for (const testCase of testCases) {
            // Setup - Preparar datos únicos para cada caso
            const productName = `Prioridad_${testCase.description}_${Date.now()}`;
            
            // Act - Agregar el producto usando Page Object
            await productPage.addProduct(productName, testCase.category, testCase.priority);

            // Assert - Validaciones
            // 1. Verificar existencia
            await productPage.expectProductExists(productName);
            const card = page.locator('[data-testid^="product-card-"]').filter({ hasText: productName });
            await expect(card).toBeVisible();

            // 2. Validar prioridad visual (estrellas)
            const priorityContainer = card.locator('[data-testid^="priority-"]');
            await expect(priorityContainer).toBeVisible();
            await expect(priorityContainer).toHaveText(testCase.expectedStars);

            // 3. Validar valor numérico de prioridad
            const actualPriority = await productPage.getProductPriority(productName);
            expect(actualPriority).toBe(testCase.priority);

            // 4. Validar estado inicial
            await expect(card.locator('[data-testid^="quantity-value-"]')).toHaveText('1');
            await expect(card.locator('[data-testid^="purchase-status-"]')).toContainText('Pendiente');

            // Cleanup - eliminar producto de prueba
            await card.locator('[data-testid^="delete-product-"]').click();
            await page.waitForResponse(r => r.url().includes('/api/products') && r.request().method() === 'DELETE');
        }
    });
});
