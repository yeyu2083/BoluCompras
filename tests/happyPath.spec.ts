import { test, expect } from '@playwright/test';
import { ProductPage } from './pages/ProductPage';

/**
 * Test de Happy Path - Flujo completo de BoluCompras
 * Cubre: Agregar → Verificar → Editar cantidad → Duplicados → Marcar comprado → Eliminar
 */
test.describe('BoluCompras - Happy Path Completo', () => {
    let productPage: ProductPage;
    const timestamp = Date.now();
    const testProduct = `HappyPath_${timestamp}`;

    test.beforeEach(async ({ page }) => {
        productPage = new ProductPage(page);
        await productPage.goto();
        await expect(page).toHaveURL('/');
        await expect(page.locator('[data-testid="product-name-input"]')).toBeAttached();
    });

    test('Validar CRUD: agregar, editar, duplicado, comprar y eliminar', async ({ page }) => {
        // ═══════════════════════════════════════════════════════════════
        // PASO 1: Agregar un producto nuevo
        // ═══════════════════════════════════════════════════════════════
        await test.step('Agregar producto inicial', async () => {
            await productPage.addProduct(testProduct, 'Frutas y Verduras', 3);
            await productPage.expectProductExists(testProduct);
            
            // Verificar prioridad (3 estrellas)
            await productPage.expectProductPriority(testProduct, '⭐⭐⭐');
        });

        // ═══════════════════════════════════════════════════════════════
        // PASO 2: Editar cantidad del producto
        // ═══════════════════════════════════════════════════════════════
        await test.step('Incrementar cantidad', async () => {
            const productCard = page.locator('[data-testid^="product-card-"]').filter({ hasText: testProduct });
            const increaseButton = productCard.locator('[data-testid^="increase-quantity-"]');
            const quantityDisplay = productCard.locator('[data-testid^="quantity-value-"]');
            
            // Cantidad inicial debe ser 1
            await expect(quantityDisplay).toContainText('1');
            
            // Incrementar cantidad
            await increaseButton.click();
            await page.waitForResponse(r => r.url().includes('/api/products') && r.request().method() === 'PATCH');
            
            // Verificar nueva cantidad
            await expect(quantityDisplay).toContainText('2');
        });

        await test.step('Decrementar cantidad', async () => {
            const productCard = page.locator('[data-testid^="product-card-"]').filter({ hasText: testProduct });
            const decreaseButton = productCard.locator('[data-testid^="decrease-quantity-"]');
            const quantityDisplay = productCard.locator('[data-testid^="quantity-value-"]');
            
            // Decrementar cantidad
            await decreaseButton.click();
            await page.waitForResponse(r => r.url().includes('/api/products') && r.request().method() === 'PATCH');
            
            // Verificar que volvió a 1
            await expect(quantityDisplay).toContainText('1');
        });

        // ═══════════════════════════════════════════════════════════════
        // PASO 3: Detección de duplicados
        // ═══════════════════════════════════════════════════════════════
        await test.step('Detectar producto duplicado', async () => {
            // Intentar agregar el mismo producto
            const productNameInput = page.locator('[data-testid="product-name-input"]');
            const addButton = page.locator('[data-testid="add-product-button"]');
            
            await productNameInput.fill(testProduct);
            await productNameInput.press('Tab');
            await addButton.click();
            
            // Esperar que aparezca el modal de duplicados
            const duplicateModal = page.locator('[role="dialog"]');
            await expect(duplicateModal).toBeVisible({ timeout: 5000 });
            
            // Verificar que el modal contiene texto sobre duplicado
            await expect(duplicateModal).toContainText(/duplicado|existente|ya existe/i);
            
            // Confirmar para guardar cambios (incrementa cantidad en el modal)
            // Primero incrementamos la cantidad en el modal
            const incrementButton = duplicateModal.locator('button').filter({ has: page.locator('svg path[d*="M10 5a1"]') });
            await incrementButton.click();
            
            // Luego guardamos los cambios
            const confirmButton = duplicateModal.getByRole('button', { name: 'Guardar cambios' });
            await confirmButton.click();
            
            // Esperar respuesta del backend
            await page.waitForResponse(r => r.url().includes('/api/products') && r.request().method() === 'PATCH');
            
            // Verificar que la cantidad incrementó a 2
            const productCard = page.locator('[data-testid^="product-card-"]').filter({ hasText: testProduct });
            const quantityDisplay = productCard.locator('[data-testid^="quantity-value-"]');
            await expect(quantityDisplay).toContainText('2');
        });

        // ═══════════════════════════════════════════════════════════════
        // PASO 4: Marcar como comprado
        // ═══════════════════════════════════════════════════════════════
        await test.step('Marcar producto como comprado', async () => {
            const productCard = page.locator('[data-testid^="product-card-"]').filter({ hasText: testProduct });
            const purchaseButton = productCard.locator('[data-testid^="purchase-status-"]');
            
            // Verificar estado inicial
            await expect(purchaseButton).toContainText('Pendiente');
            
            // Marcar como comprado
            await purchaseButton.click();
            await page.waitForResponse(r => r.url().includes('/api/products') && r.request().method() === 'PATCH');
            
            // Verificar cambio de estado
            await expect(purchaseButton).toContainText('Comprado');
        });

        // ═══════════════════════════════════════════════════════════════
        // PASO 5: Eliminar producto
        // ═══════════════════════════════════════════════════════════════
        await test.step('Eliminar producto', async () => {
            const productCard = page.locator('[data-testid^="product-card-"]').filter({ hasText: testProduct });
            const deleteButton = productCard.locator('[data-testid^="delete-product-"]');
            
            await expect(deleteButton).toBeVisible();
            await deleteButton.click();
            
            // Esperar respuesta del backend
            await page.waitForResponse(r => r.url().includes('/api/products') && r.request().method() === 'DELETE');
            
            // Verificar que el producto ya no existe
            await productPage.expectProductNotExists(testProduct);
        });
    });

    test('Cancelar duplicado no incrementa cantidad', async ({ page }) => {
        const uniqueProduct = `CancelDup_${timestamp}`;
        
        // Agregar producto inicial
        await productPage.addProduct(uniqueProduct, 'General', 1);
        await productPage.expectProductExists(uniqueProduct);
        
        // Intentar agregar duplicado
        const productNameInput = page.locator('[data-testid="product-name-input"]');
        const addButton = page.locator('[data-testid="add-product-button"]');
        
        await productNameInput.fill(uniqueProduct);
        await productNameInput.press('Tab');
        await addButton.click();
        
        // Esperar modal de duplicados
        const duplicateModal = page.locator('[role="dialog"]');
        await expect(duplicateModal).toBeVisible({ timeout: 5000 });
        
        // Cancelar la operación - buscar botón exacto "Cancelar"
        const cancelButton = duplicateModal.getByRole('button', { name: 'Cancelar' });
        await cancelButton.click();
        
        // Verificar que el modal se cerró
        await expect(duplicateModal).not.toBeVisible();
        
        // Verificar que la cantidad sigue siendo 1
        const productCard = page.locator('[data-testid^="product-card-"]').filter({ hasText: uniqueProduct });
        const quantityDisplay = productCard.locator('[data-testid^="quantity-value-"]');
        await expect(quantityDisplay).toContainText('1');
        
        // Limpiar: eliminar producto de prueba
        const deleteButton = productCard.locator('[data-testid^="delete-product-"]');
        await deleteButton.click();
        await page.waitForResponse(r => r.url().includes('/api/products') && r.request().method() === 'DELETE');
    });
});
