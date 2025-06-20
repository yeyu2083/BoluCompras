import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model para la página de productos de BoluCompras
 * Contiene todos los selectores y métodos para interactuar con la página
 */
export class ProductPage {
    readonly page: Page;
    
    // Locators para el formulario de agregar producto
    private readonly productNameInput: Locator;
    private readonly addProductButton: Locator;
    private readonly categoryButtons: Locator;
    private readonly prioritySlider: Locator;
    private readonly toggleListButton: Locator;
    
    // Locators para la lista de productos
    private readonly productCards: Locator;
    private readonly quantityValues: Locator;
    private readonly increaseButtons: Locator;
    private readonly decreaseButtons: Locator;
    private readonly deleteButtons: Locator;
    private readonly purchaseButtons: Locator;    constructor(page: Page) {
        this.page = page;
        
        // Inicializar locators del formulario
        this.productNameInput = page.locator('[data-testid="product-name-input"]');
        this.addProductButton = page.locator('[data-testid="add-product-button"]');
        this.categoryButtons = page.locator('[data-testid^="category-button-"]');
        this.prioritySlider = page.locator('input[type="range"][data-testid="priority-slider"]');
        this.toggleListButton = page.locator('[data-testid="toggle-list-button"]');
          // Inicializar locators de la lista de productos usando data-testid
        this.productCards = page.locator('[data-testid^="product-card-"]');
        this.quantityValues = page.locator('[data-testid^="quantity-value-"]');
        this.increaseButtons = page.locator('[data-testid^="increase-quantity-"]');
        this.decreaseButtons = page.locator('[data-testid^="decrease-quantity-"]');
        this.deleteButtons = page.locator('[data-testid^="delete-product-"]');
        this.purchaseButtons = page.locator('[data-testid^="purchase-status-"]');
    }

    /**
     * @description Navega a la página principal de la aplicación
     */    async goto() {
        await this.page.goto('/');
    }

    /**
     * @description Agrega un nuevo producto con los detalles especificados
     * @param name - Nombre del producto
     * @param category - Categoría del producto (opcional)
     * @param priority - Prioridad del producto (1-5, opcional)
     */    /**
     * @description Abre la lista de productos si no está visible
     */
    async openProductList() {
        if (await this.toggleListButton.textContent() === 'Ver Lista') {
            await this.toggleListButton.click();
            // Esperar a que la lista se muestre
            await this.page.waitForSelector('[data-testid^="product-card-"]', { state: 'visible' });
        }
    }

    /**
     * @description Agrega un nuevo producto y verifica que aparezca en la lista
     * @param name - Nombre del producto
     * @param category - Categoría del producto (opcional, por defecto 'General')
     * @param priority - Prioridad del producto (opcional, por defecto 1)
     */
    async addProduct(name: string, category: string = 'General', priority: number = 1) {
        // 1. Llenar el formulario
        await this.productNameInput.fill(name);
        await this.productNameInput.press('Tab');

        // 2. Seleccionar categoría
        if (category) {
            const categoryButton = this.page.locator(`[data-testid="category-button-${category}"]`);
            await categoryButton.waitFor({ state: 'visible' });
            await categoryButton.click();
        }

        // 3. Ajustar prioridad usando el slider
        if (priority !== 1) {
            await this.setPriority(priority);
        }

        // 4. Click en el botón de agregar
        await this.addProductButton.click();
        
        // 5. Abrir la lista de productos si no está visible
        await this.openProductList();
        
        // 6. Esperar a que el producto aparezca en la lista
        await this.page.waitForSelector(`[data-testid^="product-card-"]`, { 
            state: 'visible',
            timeout: 5000 
        });
    }

    /**
     * @description Establece la prioridad usando el slider
     * @param priority - Valor de prioridad entre 1 y 5
     */
    private async setPriority(priority: number) {
        try {
            // 1. Asegurarnos que el slider está visible y habilitado
            await this.prioritySlider.waitFor({ state: 'visible', timeout: 5000 });
            await expect(this.prioritySlider).toBeEnabled();

            // 2. Establecer el valor directamente usando fill
            await this.prioritySlider.fill(priority.toString());
            await this.page.waitForTimeout(100); // Pequeña pausa para que se actualice el valor

            // 3. Verificar que el valor se estableció correctamente
            const actualValue = await this.prioritySlider.inputValue();
            if (actualValue !== priority.toString()) {
                // Si el fill no funcionó, intentar con el método de arrastre
                await this.setPriorityByDrag(priority);
            }

            // Validaciones adicionales
            await this.validatePriorityValue(priority);
        } catch (error) {
            console.error('Error al ajustar la prioridad:', error);
            throw new Error(`No se pudo ajustar la prioridad a ${priority}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }

    /**
     * @description Establece la prioridad arrastrando el slider como último recurso
     * @param priority - Valor de prioridad entre 1 y 5
     */
    private async setPriorityByDrag(priority: number) {
        const sliderBox = await this.prioritySlider.boundingBox();
        if (!sliderBox) throw new Error('No se pudo obtener la posición del slider');

        // Calcular la posición exacta
        const min = 1;
        const max = 5;
        const step = sliderBox.width / (max - min);
        const targetX = sliderBox.x + (step * (priority - min));
        const centerY = sliderBox.y + (sliderBox.height / 2);

        // Mover en pasos pequeños para mayor precisión
        await this.page.mouse.move(sliderBox.x + (sliderBox.width / 2), centerY);
        await this.page.mouse.down();
        await this.page.mouse.move(targetX, centerY, { steps: 20 });
        await this.page.mouse.up();

        // Verificar el resultado
        await this.page.waitForTimeout(100);
        const finalValue = await this.prioritySlider.inputValue();
        if (finalValue !== priority.toString()) {
            throw new Error(`No se pudo establecer la prioridad. Valor esperado: ${priority}, valor actual: ${finalValue}`);
        }
    }

    /**
     * @description Obtiene el valor actual del slider de prioridad
     * @returns El valor actual del slider
     */
    private async getCurrentPriorityValue(): Promise<number> {
        await this.prioritySlider.waitFor({ state: 'visible' });
        const value = await this.prioritySlider.inputValue();
        return parseInt(value, 10);
    }

    /**
     * @description Valida que la prioridad se haya establecido correctamente
     * @param expectedPriority - Valor esperado de la prioridad
     */
    private async validatePriorityValue(expectedPriority: number) {
        const actualPriority = await this.getCurrentPriorityValue();
        if (actualPriority !== expectedPriority) {
            throw new Error(
                `La prioridad no se estableció correctamente. ` +
                `Esperado: ${expectedPriority}, Actual: ${actualPriority}`
            );
        }
    }

    /**
     * @description Incrementa la cantidad de un producto específico
     * @param productName - Nombre del producto a incrementar
     */    async increaseQuantity(productName: string) {
        const card = await this.getProductCard(productName);
        await card.locator('button.increment-button').click();
        // Esperamos a que la cantidad se actualice
        await this.page.waitForResponse(response => response.url().includes('/api/products') && response.request().method() === 'PUT');
    }

    /**
     * @description Decrementa la cantidad de un producto específico
     * @param productName - Nombre del producto a decrementar
     */
    async decreaseQuantity(productName: string) {
        const card = await this.getProductCard(productName);
        await card.locator('button.decrement-button').click();
        // Esperamos a que la cantidad se actualice
        await this.page.waitForResponse(response => response.url().includes('/api/products') && response.request().method() === 'PUT');
    }

    /**
     * @description Marca/Desmarca un producto como comprado
     * @param productName - Nombre del producto a marcar/desmarcar
     */
    async togglePurchaseStatus(productName: string) {
        const card = await this.getProductCard(productName);
        await card.locator('button.purchase-status').click();
        // Esperamos a que el estado se actualice
        await this.page.waitForResponse(response => response.url().includes('/api/products') && response.request().method() === 'PUT');
    }

    /**
     * @description Elimina un producto específico
     * @param productName - Nombre del producto a eliminar
     */    async deleteProduct(productName: string) {
        const card = await this.getProductCard(productName);
        await card.locator('[data-testid="delete-product-6838fb07ddc23d23d9763b9f"]').click();
        // Esperamos a que el producto sea eliminado
        await this.page.waitForResponse(response => response.url().includes('/api/products') && response.request().method() === 'DELETE');
    }

    /**
     * @description Verifica que un producto exista en la lista
     * @param productName - Nombre del producto a verificar
     */
    async expectProductExists(productName: string) {
        const card = await this.getProductCard(productName);
        await expect(card).toBeVisible({ timeout: 5000 });
    }

    /**
     * @description Verifica que un producto NO exista en la lista
     * @param productName - Nombre del producto a verificar
     */
    async expectProductNotExists(productName: string) {
        await expect(this.productCards.filter({ hasText: productName }))
            .toHaveCount(0, { timeout: 5000 });
    }

    /**
     * @description Verifica la cantidad de un producto específico
     * @param productName - Nombre del producto a verificar
     * @param expectedQuantity - Cantidad esperada
     */
    async expectProductQuantity(productName: string, expectedQuantity: number) {
        const card = await this.getProductCard(productName);
        const quantityText = card.locator('.quantity-value');
        await expect(quantityText).toHaveText(expectedQuantity.toString(), { timeout: 5000 });
    }

    /**
     * @description Verifica el estado de compra de un producto
     * @param productName - Nombre del producto a verificar
     * @param purchased - True si se espera que esté comprado, false si no
     */
    async expectPurchaseStatus(productName: string, purchased: boolean) {
        const card = await this.getProductCard(productName);
        const status = card.locator('.purchase-status');
        await expect(status).toHaveText(purchased ? 'Comprado' : 'Pendiente', { timeout: 5000 });
    }

    /**
     * @description Verifica que un producto tenga la cantidad de estrellas esperada
     * @param productName - Nombre del producto a verificar
     * @param expectedStars - String con las estrellas esperadas (ej: "⭐⭐⭐")
     */    async expectProductPriority(productName: string, expectedStars: string) {
        const card = await this.getProductCard(productName);
        // Buscar el elemento que contiene las estrellas
        const priorityContainer = card.locator('[data-testid^="priority-"]');
        await expect(priorityContainer).toBeVisible({ timeout: 5000 });
        const actualStars = await priorityContainer.textContent();
        if (!actualStars) {
            throw new Error(`No se encontró el texto de prioridad para el producto "${productName}"`);
        }
        expect(actualStars.trim()).toBe(expectedStars);
    }

    /**
     * @description Obtiene el elemento de la tarjeta de un producto específico
     * @param productName - Nombre del producto a buscar
     * @returns Locator de la tarjeta del producto
     */    private async getProductCard(productName: string): Promise<Locator> {
        // Primero buscamos todas las tarjetas
        const allCards = this.productCards;
        
        // Buscamos la tarjeta que contiene el nombre del producto
        for (const card of await allCards.all()) {
            const nameElement = card.locator('[data-testid^="product-name-"]');
            if (await nameElement.textContent() === productName) {
                await expect(card).toBeVisible({ timeout: 5000 });
                return card;
            }
        }
        
        throw new Error(`No se encontró el producto con nombre "${productName}"`);
    }

    /**
     * @description Obtiene el valor numérico de la prioridad de un producto contando sus estrellas
     * @param productName - Nombre del producto a verificar
     * @returns El número de estrellas (prioridad) del producto
     */
    async getProductPriority(productName: string): Promise<number> {
        const card = await this.getProductCard(productName);
        const priorityContainer = card.locator('[data-testid^="priority-"]');
        await expect(priorityContainer).toBeVisible({ timeout: 5000 });
        const stars = await priorityContainer.textContent();
        if (!stars) {
            throw new Error(`No se encontró el indicador de prioridad para "${productName}"`);
        }
        return stars.trim().split('⭐').length - 1; // -1 porque split genera un array con un elemento vacío al final
    }
}
